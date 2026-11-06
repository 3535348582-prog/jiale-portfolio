import { env } from "cloudflare:workers";

const ORIGINS = new Set([
  "https://jiale-shen-portfolio.surge.sh",
  "http://127.0.0.1:8796", "http://127.0.0.1:8797",
  "http://localhost:8796", "http://localhost:8797",
]);
const STARS = new Set(["Ari", "Tau", "Gem", "Cnc", "Leo", "Vir", "Lib", "Sco", "Sgr", "Cap", "Aqr", "Psc"]);
const SITE = "jiale-portfolio";
const MAX_JSON = 8192;
type Profile = { id: string; nickname: string; star: string };
type Row = { id: string; body: string; parent_id: string | null; created_at: number; deleted: number; author_id: string; nickname: string; star: string; likes: number; liked_by_me: number };
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public retryAfter?: number) { super(message); }
}
function db() {
  if (!env.DB) throw new ApiError(503, "storage_unavailable", "留言服务正在准备，请稍后重试。");
  return env.DB;
}
function allowed(request: Request) {
  const origin = request.headers.get("Origin");
  // Native API clients may omit Origin. Browsers from other origins may never
  // read responses or issue a state-changing request with an unsupported origin.
  if (origin && !ORIGINS.has(origin)) throw new ApiError(403, "origin_not_allowed", "此来源暂不允许访问留言服务。");
}
function headers(request: Request) {
  const result = new Headers({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Vary": "Origin", "X-Content-Type-Options": "nosniff" });
  const origin = request.headers.get("Origin");
  if (origin && ORIGINS.has(origin)) result.set("Access-Control-Allow-Origin", origin);
  result.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  result.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
  result.set("Access-Control-Expose-Headers", "Retry-After");
  result.set("Access-Control-Max-Age", "600");
  return result;
}
export async function handle(request: Request, action: () => Promise<unknown>, status = 200) {
  try {
    allowed(request);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: headers(request) });
    return new Response(JSON.stringify(await action()), { status, headers: headers(request) });
  } catch (error) {
    const e = error instanceof ApiError ? error : new ApiError(500, "service_error", "留言服务暂时不可用，请稍后重试。");
    const responseHeaders = headers(request);
    if (e.retryAfter) responseHeaders.set("Retry-After", String(e.retryAfter));
    if (!(error instanceof ApiError)) console.error("guestbook request failed", error instanceof Error ? error.message : "Unexpected error");
    return new Response(JSON.stringify({ error: e.message, code: e.code }), { status: e.status, headers: responseHeaders });
  }
}
export async function payload(request: Request) {
  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) throw new ApiError(415, "json_required", "请使用 JSON 提交留言。");
  const size = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(size) && size > MAX_JSON) throw new ApiError(400, "body_too_large", "提交的内容过长。");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "invalid_json", "提交内容格式不正确。");
  const decoder = new TextDecoder(); let total = 0, text = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_JSON) { await reader.cancel(); throw new ApiError(400, "body_too_large", "提交的内容过长。"); }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  let data: Record<string, unknown>;
  try { data = JSON.parse(text); } catch { throw new ApiError(400, "invalid_json", "提交内容格式不正确。"); }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new ApiError(400, "invalid_json", "提交内容格式不正确。");
  if (data.website !== undefined && data.website !== "") throw new ApiError(400, "invalid_submission", "提交未通过检查。");
  return data;
}
function cleanString(value: unknown, field: string, max: number) {
  if (typeof value !== "string") throw new ApiError(400, "invalid_" + field, field === "nickname" ? "请填写昵称。" : "请填写留言内容。");
  const text = value.trim();
  if (!text || Array.from(text).length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text)) throw new ApiError(400, "invalid_" + field, field === "nickname" ? "昵称需为 1–24 个字符。" : "留言需为 1–1000 个字符。");
  return text;
}
function cleanStar(value: unknown) {
  if (typeof value !== "string" || !STARS.has(value)) throw new ApiError(400, "invalid_star", "请选择有效的星座。");
  return value;
}
async function hash(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map(n => n.toString(16).padStart(2, "0")).join("");
}
async function visitor(request: Request, required = true): Promise<Profile | null> {
  const authorization = request.headers.get("Authorization");
  if (!authorization && !required) return null;
  const token = authorization?.match(/^Bearer ([a-f0-9]{64})$/i)?.[1];
  if (!token) throw new ApiError(401, "visitor_required", "请先填写昵称，建立本机留言身份。");
  const profile = await db().prepare("SELECT id,nickname,star FROM profiles WHERE token_hash=?").bind(await hash(token)).first<Profile>();
  if (!profile) throw new ApiError(401, "visitor_expired", "本机留言身份已失效，请重新填写昵称。");
  return profile;
}
export async function createSession(request: Request) {
  const data = await payload(request), nickname = cleanString(data.nickname, "nickname", 24), star = cleanStar(data.star);
  const now = Date.now(), hour = Math.floor(now / 3600000);
  const ip = request.headers.get("CF-Connecting-IP") || "local";
  const ipHash = await hash(SITE + ":" + ip);
  const limit = await db().prepare("INSERT INTO session_limits(ip_hash,hour,count) VALUES(?,?,1) ON CONFLICT(ip_hash,hour) DO UPDATE SET count=count+1 WHERE count<10 RETURNING count").bind(ipHash, hour).first();
  if (!limit) throw new ApiError(429, "session_rate_limit", "本小时创建身份次数较多，请稍后再试。", 3600 - Math.floor((now % 3600000) / 1000));
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(n => n.toString(16).padStart(2, "0")).join("");
  const profile = { id: crypto.randomUUID(), nickname, star };
  await db().batch([
    db().prepare("INSERT INTO profiles(id,token_hash,nickname,star,created_at,last_post_at) VALUES(?,?,?,?,?,0)").bind(profile.id, await hash(token), nickname, star, now),
    db().prepare("DELETE FROM session_limits WHERE hour<?").bind(hour - 24),
  ]);
  return { token, visitor: profile };
}
export async function updateSession(request: Request) {
  const who = (await visitor(request))!, data = await payload(request);
  const nickname = data.nickname === undefined ? who.nickname : cleanString(data.nickname, "nickname", 24);
  const star = data.star === undefined ? who.star : cleanStar(data.star);
  await db().prepare("UPDATE profiles SET nickname=?,star=? WHERE id=?").bind(nickname, star, who.id).run();
  return { visitor: { id: who.id, nickname, star } };
}
const COMMENT_SELECT = `SELECT c.id,c.body,c.parent_id,c.created_at,c.deleted,c.author_id,p.nickname,p.star,
 (SELECT COUNT(*) FROM reactions r WHERE r.comment_id=c.id AND r.active=1) AS likes,
 EXISTS(SELECT 1 FROM reactions r WHERE r.comment_id=c.id AND r.visitor_id=? AND r.active=1) AS liked_by_me
 FROM comments c JOIN profiles p ON p.id=c.author_id`;
function output(row: Row) {
  return { id: row.id, body: row.deleted ? "" : row.body, parentId: row.parent_id, createdAt: row.created_at,
    author: { id: row.author_id, nickname: row.nickname, star: row.star }, likes: Number(row.likes), likedByMe: !!row.liked_by_me, deleted: !!row.deleted };
}
export async function listComments(request: Request) {
  const who = await visitor(request, false), raw = new URL(request.url).searchParams.get("cursor");
  let before = Number.MAX_SAFE_INTEGER, beforeId = "\uffff";
  if (raw) {
    try {
      if (raw.length > 256) throw new Error();
      const cursor = JSON.parse(atob(raw));
      if (!Number.isSafeInteger(cursor.at) || cursor.at < 0 || typeof cursor.id !== "string" || cursor.id.length > 64) throw new Error();
      before = cursor.at; beforeId = cursor.id;
    } catch { throw new ApiError(400, "invalid_cursor", "分页位置无效，请重新加载。"); }
  }
  // Keep deleted ancestors only while a visible descendant needs its thread.
  // A completely deleted thread therefore disappears from the public list.
  const visible = "WITH RECURSIVE visible(id) AS (SELECT id FROM comments WHERE deleted=0 UNION SELECT c.parent_id FROM comments c JOIN visible v ON c.id=v.id WHERE c.parent_id IS NOT NULL) ";
  const rows = await db().prepare(visible + COMMENT_SELECT + " WHERE c.id IN (SELECT id FROM visible) AND (c.created_at<? OR (c.created_at=? AND c.id<?)) ORDER BY c.created_at DESC,c.id DESC LIMIT 101").bind(who?.id || "", before, before, beforeId).all<Row>();
  const page = rows.results.slice(0, 100), last = page.at(-1);
  const nextCursor = rows.results.length > 100 && last ? btoa(JSON.stringify({ at: last.created_at, id: last.id })) : null;
  return { comments: page.reverse().map(output), nextCursor, visitor: who };
}
export async function createComment(request: Request) {
  const who = (await visitor(request))!, data = await payload(request), body = cleanString(data.body, "body", 1000);
  const parentId = data.parentId == null ? null : cleanString(data.parentId, "parent", 64);
  if (parentId && !(await db().prepare("SELECT id FROM comments WHERE id=? AND deleted=0").bind(parentId).first())) throw new ApiError(404, "parent_missing", "要回复的留言已不存在。");
  const now = Date.now();
  const reserved = await db().prepare("UPDATE profiles SET last_post_at=? WHERE id=? AND last_post_at<=? AND (SELECT COUNT(*) FROM comments WHERE author_id=? AND created_at>?)<15 RETURNING id").bind(now, who.id, now - 10000, who.id, now - 3600000).first();
  if (!reserved) throw new ApiError(429, "comment_rate_limit", "请稍等片刻再留言；每小时最多发布 15 条。", 10);
  const id = crypto.randomUUID();
  await db().prepare("INSERT INTO comments(id,author_id,body,parent_id,created_at,deleted) VALUES(?,?,?,?,?,0)").bind(id, who.id, body, parentId, now).run();
  const row = await db().prepare(COMMENT_SELECT + " WHERE c.id=?").bind(who.id, id).first<Row>();
  return { comment: output(row!) };
}
export async function likeComment(request: Request, id: string) {
  const who = (await visitor(request))!; await payload(request);
  // A single UPSERT makes concurrent toggles linearizable. SELECT also guards
  // against adding a reaction after the comment has been soft-deleted.
  const toggled = await db().prepare("INSERT INTO reactions(comment_id,visitor_id,created_at,active) SELECT id,?,?,1 FROM comments WHERE id=? AND deleted=0 ON CONFLICT(comment_id,visitor_id) DO UPDATE SET active=1-reactions.active RETURNING active").bind(who.id, Date.now(), id).first<{ active: number }>();
  if (!toggled) throw new ApiError(404, "comment_missing", "这条留言已不存在。");
  const counts = await db().prepare("SELECT COUNT(*) AS likes FROM reactions WHERE comment_id=? AND active=1").bind(id).first<{ likes: number }>();
  return { likes: Number(counts?.likes || 0), likedByMe: !!toggled.active };
}
export async function deleteComment(request: Request, id: string) {
  const who = (await visitor(request))!;
  const comment = await db().prepare("SELECT author_id FROM comments WHERE id=?").bind(id).first<{ author_id: string }>();
  if (!comment) throw new ApiError(404, "comment_missing", "这条留言已不存在。");
  if (comment.author_id !== who.id) throw new ApiError(403, "not_owner", "只能删除自己的留言。");
  await db().batch([
    db().prepare("UPDATE comments SET body='',deleted=1 WHERE id=? AND author_id=?").bind(id, who.id),
    db().prepare("DELETE FROM reactions WHERE comment_id=?").bind(id),
  ]);
  return { id, deleted: true };
}
