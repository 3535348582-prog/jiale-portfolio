import { env } from "cloudflare:workers";
import { connect } from "cloudflare:sockets";

// Only this mailbox can send or receive creator verification mail. Never take
// SMTP destinations, addresses, headers, or credentials from an HTTP request.
const MAILBOX = "3535348582@qq.com";
const HOST = "smtp.qq.com";
const TIMEOUT_MS = 20_000;
const SEND_FAILURE = "Owner verification email could not be sent.";
const encoder = new TextEncoder();
type SmtpStage = "connect" | "greeting" | "hello" | "auth" | "from" | "recipient" | "data" | "quit" | "timeout";
function smtpFailure(stage: SmtpStage): Error & { smtpStage: SmtpStage } {
  return Object.assign(new Error(SEND_FAILURE), { smtpStage: stage });
}

function authorizationCode(): string {
  const value = typeof env.QQ_SMTP_AUTH_CODE === "string" ? env.QQ_SMTP_AUTH_CODE.trim() : "";
  // QQ uses an application authorization code, not the mailbox password.
  return /^[A-Za-z0-9]{12,128}$/.test(value) ? value : "";
}

export function isOwnerMailConfigured(): boolean {
  return !!authorizationCode();
}

function base64(value: string): string {
  let binary = "";
  for (const byte of encoder.encode(value)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function encodedWords(value: string): string {
  const parts: string[] = []; let word = "";
  // At most 42 UTF-8 bytes: each encoded-word is <=68 ASCII characters, so
  // even the first Subject line stays within 78 columns. Never split a code point.
  for (const character of value) {
    if (encoder.encode(word + character).length > 42) {
      parts.push(`=?UTF-8?B?${base64(word)}?=`); word = "";
    }
    word += character;
  }
  if (word) parts.push(`=?UTF-8?B?${base64(word)}?=`);
  return parts.join("\r\n ");
}

function message(code: string): string {
  const body = [
    "沈佳乐作品集 · 站主验证",
    "",
    `本次验证码：${code}`,
    "",
    "验证码有效期为一分钟，且仅可使用一次。",
    "请仅在你主动打开的作品集站主验证页面输入，不要转发。",
    "如果不是你本人发起的请求，请忽略本邮件。",
  ].join("\r\n");
  const encodedBody = base64(body).match(/.{1,76}/g)?.join("\r\n") || "";
  return [
    `From: Jiale Portfolio <${MAILBOX}>`,
    `To: <${MAILBOX}>`,
    `Subject: ${encodedWords("站主登录验证码 · 沈佳乐作品集")}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@jiale-shen-portfolio.surge.sh>`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    encodedBody,
  ].join("\r\n");
}

export async function sendOwnerCode(code: string, expiresAt: number): Promise<void> {
  const auth = authorizationCode();
  // Prevent command/header injection and stale or nonsensical requests before
  // opening a socket. The authentication module owns actual OTP expiration.
  if (!auth || !/^\d{6}$/.test(code) || !Number.isSafeInteger(expiresAt)
      || expiresAt <= Date.now() || expiresAt > Date.now() + 120_000) {
    throw smtpFailure("connect");
  }

  let socket: ReturnType<typeof connect> | undefined;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let writer: WritableStreamDefaultWriter<Uint8Array> | undefined;
  let accepted = false, cleaned = false;
  let stage: SmtpStage = "connect";
  let timer: ReturnType<typeof setTimeout> | undefined;

  function cleanup() {
    if (cleaned) return;
    cleaned = true;
    // close() forcibly shuts both streams; do not await an uncooperative peer.
    try { void socket?.close().catch(() => {}); } catch {}
    const releaseReader = () => { try { reader?.releaseLock(); } catch {} };
    const releaseWriter = () => { try { writer?.releaseLock(); } catch {} };
    try { void reader?.cancel().catch(() => {}).finally(releaseReader); } catch { releaseReader(); }
    try { void writer?.abort().catch(() => {}).finally(releaseWriter); } catch { releaseWriter(); }
  }

  async function deliver() {
    socket = connect({ hostname: HOST, port: 465 }, { secureTransport: "on", allowHalfOpen: false });
    // Worker sockets can reject closed independently of the current read.
    void socket.closed.catch(() => {});
    reader = socket.readable.getReader();
    writer = socket.writable.getWriter();
    await socket.opened;

    const decoder = new TextDecoder();
    let buffered = "", receivedBytes = 0;
    async function line(): Promise<string> {
      for (;;) {
        const end = buffered.indexOf("\r\n");
        if (end >= 0) {
          if (end > 2048) throw new Error(SEND_FAILURE);
          const value = buffered.slice(0, end);
          buffered = buffered.slice(end + 2);
          return value;
        }
        if (buffered.includes("\n") || buffered.length > 2048) throw new Error(SEND_FAILURE);
        const chunk = await reader!.read();
        if (chunk.done) throw new Error(SEND_FAILURE);
        receivedBytes += chunk.value.byteLength;
        if (receivedBytes > 65_536) throw new Error(SEND_FAILURE);
        buffered += decoder.decode(chunk.value, { stream: true });
        if (buffered.length > 16_384) throw new Error(SEND_FAILURE);
      }
    }

    async function reply(expected: readonly number[]): Promise<void> {
      let codeNumber: number | undefined, bytes = 0;
      for (let count = 0; count < 64; count++) {
        const value = await line(); bytes += value.length + 2;
        const match = /^([2-5]\d{2})(?:([ -]).*)?$/.exec(value);
        if (!match || bytes > 16_384) throw new Error(SEND_FAILURE);
        const current = Number(match[1]);
        if (codeNumber === undefined) codeNumber = current;
        if (current !== codeNumber) throw new Error(SEND_FAILURE);
        if (match[2] !== "-") {
          if (!expected.includes(current)) throw new Error(SEND_FAILURE);
          return;
        }
      }
      throw new Error(SEND_FAILURE);
    }

    async function command(value: string, expected: readonly number[]) {
      await writer!.write(encoder.encode(value + "\r\n"));
      await reply(expected);
    }

    stage = "greeting";
    await reply([220]);
    stage = "hello";
    await command("EHLO jiale-shen-portfolio.surge.sh", [250]);
    stage = "auth";
    await command("AUTH LOGIN", [334]);
    await command(base64(MAILBOX), [334]);
    await command(base64(auth), [235]);
    stage = "from";
    await command(`MAIL FROM:<${MAILBOX}>`, [250]);
    stage = "recipient";
    await command(`RCPT TO:<${MAILBOX}>`, [250, 251]);
    stage = "data";
    await command("DATA", [354]);
    const data = message(code).replace(/(^|\r\n)\./g, "$1..");
    await writer!.write(encoder.encode(data + "\r\n.\r\n"));
    await reply([250]);
    accepted = true;
    // Once DATA is accepted, a QUIT/close failure must not trigger another mail.
    stage = "quit";
    try { await command("QUIT", [221]); } catch {}
  }

  try {
    await Promise.race([
      deliver(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => { stage = "timeout"; cleanup(); reject(smtpFailure("timeout")); }, TIMEOUT_MS);
      }),
    ]);
  } catch {
    if (!accepted) throw smtpFailure(stage);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    cleanup();
  }
}
