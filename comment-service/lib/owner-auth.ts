import { env } from "cloudflare:workers";
import ownerProfiles from "./owner-profile-ids.json";
import { isOwnerMailConfigured, sendOwnerCode } from "./owner-mail";

const STATIC_OWNERS = new Set(ownerProfiles.profileIds.map(id => id.toLowerCase()));
const CODE_TTL = 60_000;
const GRANT_TTL = 8 * 60 * 60_000;
const MAILBOX = "353****582@qq.com";
export class OwnerAuthError extends Error {
  constructor(public status: number, public code: string, message: string, public retryAfter?: number) { super(message); }
}
function db() { if (!env.DB) throw new OwnerAuthError(503, "storage_unavailable", "留言服务暂时不可用。"); return env.DB; }
function secret() { const value=env.OWNER_OTP_SECRET; if (!value || value.length < 32) throw new OwnerAuthError(503, "owner_mail_unavailable", "站主邮箱验证尚未配置，请稍后再试。"); return value; }
async function digest(value: string) {
  const key=await crypto.subtle.importKey("raw", new TextEncoder().encode(secret()), {name:"HMAC",hash:"SHA-256"}, false, ["sign"]);
  const result=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(value));
  return Array.from(new Uint8Array(result)).map(n=>n.toString(16).padStart(2,"0")).join("");
}
function randomHex() { return Array.from(crypto.getRandomValues(new Uint8Array(32))).map(n=>n.toString(16).padStart(2,"0")).join(""); }
function randomCode() {
  // Rejection sampling avoids modulo bias while preserving leading zeroes.
  const values=new Uint32Array(1),limit=Math.floor(0x1_0000_0000/1_000_000)*1_000_000;
  do { crypto.getRandomValues(values); } while (values[0]>=limit);
  return String(values[0]%1_000_000).padStart(6,"0");
}
export async function knownOwnerIds(ids: string[]) {
  const owners=new Set(ids.filter(id=>STATIC_OWNERS.has(id.toLowerCase())));
  const unique=[...new Set(ids)];
  if (unique.length) {
    const rows=await db().prepare("SELECT profile_id FROM owner_bindings WHERE profile_id IN ("+unique.map(()=>"?").join(",")+")").bind(...unique).all<{profile_id:string}>();
    for(const row of rows.results) owners.add(row.profile_id);
  }
  return owners;
}
export async function isKnownOwner(id: string) { return (await knownOwnerIds([id])).has(id); }
export async function hasOwnerGrant(request: Request, profileId: string) {
  const token=request.headers.get("X-Owner-Grant");
  if(!token || !/^[a-f0-9]{64}$/i.test(token) || !env.OWNER_OTP_SECRET || env.OWNER_OTP_SECRET.length<32) return false;
  const row=await db().prepare("SELECT token_hash FROM owner_login_grants WHERE token_hash=? AND profile_id=? AND expires_at>?").bind(await digest("grant:"+profileId+":"+token),profileId,Date.now()).first();
  return !!row;
}
function invalidCode() { return new OwnerAuthError(400,"owner_code_invalid","验证码未通过验证，可能已过期、已使用或输入有误，请重新获取。"); }
async function validateOwnerSendKey(request: Request, ownerKey: unknown) {
  const expected=env.OWNER_SEND_KEY_SHA256;
  if(typeof expected!=="string" || !/^[a-f0-9]{64}$/i.test(expected)) throw new OwnerAuthError(503,"owner_key_unavailable","站主发送口令尚未配置，请稍后再试。");
  if(typeof ownerKey!=="string" || ownerKey.length<16 || ownerKey.length>128) throw new OwnerAuthError(400,"owner_key_required","请填写有效的私密站主发送口令。");
  const ipHash=await digest("key-ip:"+(request.headers.get("CF-Connecting-IP")||"local"));
  const scope="key-ip:"+ipHash,now=Date.now(),window=Math.floor(now/900_000)*900_000;
  const retry=()=>Math.max(1,Math.ceil((window+900_000-Date.now())/1000));
  const locked=()=>new OwnerAuthError(429,"owner_key_rate_limit","发送口令错误次数较多，请稍后再试。",retry());
  const previous=await db().prepare("SELECT count FROM owner_login_limits WHERE scope=? AND window_start=?").bind(scope,window).first<{count:number}>();
  if(previous&&previous.count>=5) throw locked();
  const hashed=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("JIALE_OWNER_MAIL_SEND_V1\0"+ownerKey));
  const actual=Array.from(new Uint8Array(hashed)).map(n=>n.toString(16).padStart(2,"0")).join("");
  const canonical=expected.toLowerCase();let difference=0;
  // Always compare all digest positions. Never persist or log the supplied key.
  for(let i=0;i<64;i++) difference|=actual.charCodeAt(i)^canonical.charCodeAt(i);
  if(difference!==0) {
    const counted=await db().prepare("INSERT INTO owner_login_limits(scope,window_start,count,updated_at) VALUES(?,?,1,?) ON CONFLICT(scope,window_start) DO UPDATE SET count=count+1,updated_at=excluded.updated_at WHERE count<5 RETURNING count").bind(scope,window,now).first<{count:number}>();
    if(!counted) throw locked();
    throw new OwnerAuthError(403,"owner_key_invalid","私密站主发送口令不正确。");
  }
}
export async function requestOwnerCode(request: Request, profileId: string, ownerKey: unknown) {
  await validateOwnerSendKey(request,ownerKey);
  secret();
  if(!isOwnerMailConfigured()) throw new OwnerAuthError(503,"owner_mail_unavailable","站主邮箱验证尚未配置，请稍后再试。");
  const ipHash=await digest("ip:"+(request.headers.get("CF-Connecting-IP")||"local"));
  const now=Date.now(),hour=Math.floor(now/3_600_000)*3_600_000,day=Math.floor(now/86_400_000)*86_400_000;
  const id=crypto.randomUUID(),code=randomCode(),provisionalExpiry=now+CODE_TTL;
  const codeHash=await digest("code:"+profileId+":"+id+":"+code);
  const ipScope="ip:"+ipHash;
  // D1 batch is a transaction: the challenge and all quota reservations succeed
  // together, so concurrent requests cannot race around a cooldown or budget.
  const insert=db().prepare(`INSERT INTO owner_login_codes(id,profile_id,code_hash,created_at,expires_at,ready,attempts,consumed_at)
    SELECT ?,?,?,?,?,0,0,NULL WHERE
    COALESCE((SELECT updated_at FROM owner_login_limits WHERE scope='mail:cooldown' AND window_start=0),0)<=?
    AND COALESCE((SELECT count FROM owner_login_limits WHERE scope=? AND window_start=?),0)<6
    AND COALESCE((SELECT count FROM owner_login_limits WHERE scope='mail:hour' AND window_start=?),0)<10
    AND COALESCE((SELECT count FROM owner_login_limits WHERE scope='mail:day' AND window_start=?),0)<40`).bind(id,profileId,codeHash,now,provisionalExpiry,now-CODE_TTL,ipScope,hour,hour,day);
  const reserve=(scope:string,window:number)=>db().prepare(`INSERT INTO owner_login_limits(scope,window_start,count,updated_at) SELECT ?,?,1,? WHERE EXISTS(SELECT 1 FROM owner_login_codes WHERE id=?)
    ON CONFLICT(scope,window_start) DO UPDATE SET count=count+1,updated_at=excluded.updated_at`).bind(scope,window,now,id);
  await db().batch([insert,reserve("mail:cooldown",0),reserve(ipScope,hour),reserve("mail:hour",hour),reserve("mail:day",day),
    db().prepare("UPDATE owner_login_codes SET ready=0,consumed_at=? WHERE profile_id=? AND id<>? AND consumed_at IS NULL AND EXISTS(SELECT 1 FROM owner_login_codes WHERE id=?)").bind(now,profileId,id,id),
    db().prepare("DELETE FROM owner_login_codes WHERE expires_at<?").bind(now-86_400_000),
    db().prepare("DELETE FROM owner_login_grants WHERE expires_at<?").bind(now-86_400_000),
    db().prepare("DELETE FROM owner_login_limits WHERE window_start>0 AND window_start<?").bind(day-2*86_400_000)]);
  const accepted=await db().prepare("SELECT id FROM owner_login_codes WHERE id=?").bind(id).first();
  if(!accepted) {
    const limits=await db().prepare("SELECT scope,window_start,count,updated_at FROM owner_login_limits WHERE (scope='mail:cooldown' AND window_start=0) OR (scope=? AND window_start=?) OR (scope='mail:hour' AND window_start=?) OR (scope='mail:day' AND window_start=?)").bind(ipScope,hour,hour,day).all<{scope:string;window_start:number;count:number;updated_at:number}>();
    let until=now;
    for(const limit of limits.results) {
      if(limit.scope==="mail:cooldown") until=Math.max(until,limit.updated_at+CODE_TTL);
      else if((limit.scope===ipScope&&limit.count>=6) || (limit.scope==="mail:hour"&&limit.count>=10)) until=Math.max(until,limit.window_start+3_600_000);
      else if(limit.scope==="mail:day"&&limit.count>=40) until=Math.max(until,limit.window_start+86_400_000);
    }
    throw new OwnerAuthError(429,"owner_login_rate_limit","验证码请求较多，请稍后再试。",Math.max(1,Math.ceil((until-Date.now())/1000)));
  }
  let expiresAt=provisionalExpiry;
  try {
    await sendOwnerCode(code,provisionalExpiry);
    const sentAt=Date.now();expiresAt=sentAt+CODE_TTL;
    await db().batch([
      db().prepare("UPDATE owner_login_codes SET ready=1,expires_at=? WHERE id=? AND consumed_at IS NULL").bind(expiresAt,id),
      db().prepare("UPDATE owner_login_limits SET updated_at=MAX(updated_at,?) WHERE scope='mail:cooldown' AND window_start=0").bind(sentAt)]);
    const active=await db().prepare("SELECT id FROM owner_login_codes WHERE id=? AND ready=1 AND consumed_at IS NULL").bind(id).first();
    if(!active) throw new Error("Challenge superseded");
  } catch (error) {
    const rawStage=(error as {smtpStage?:unknown})?.smtpStage;
    const allowedStages=["connect","greeting","hello","auth","from","recipient","data","quit","timeout"];
    const stage=typeof rawStage==="string"&&allowedStages.includes(rawStage)?rawStage:"unknown";
    console.warn("Owner verification email failed",{stage});
    await db().prepare("UPDATE owner_login_codes SET ready=0,consumed_at=? WHERE id=?").bind(Date.now(),id).run();
    throw new OwnerAuthError(503,"owner_mail_failed","验证码未能确认发送，请稍后手动重试。",60);
  }
  const remaining=Math.max(0,Math.ceil((expiresAt-Date.now())/1000));
  return {challengeId:id,expiresAt,expiresIn:remaining,mailbox:MAILBOX,retryAfter:remaining,resendAfter:remaining};
}
export async function verifyOwnerCode(profileId:string,data:Record<string,unknown>) {
  secret();
  const id=typeof data.challengeId==="string"?data.challengeId:"",code=typeof data.code==="string"?data.code.trim():"";
  if(!/^[a-f0-9-]{36}$/i.test(id) || code.length>64) throw new OwnerAuthError(400,"invalid_owner_code_request","请填写有效的验证码。");
  const codeHash=await digest("code:"+profileId+":"+id+":"+code),now=Date.now();
  const claimed=await db().prepare("UPDATE owner_login_codes SET consumed_at=? WHERE id=? AND profile_id=? AND code_hash=? AND ready=1 AND consumed_at IS NULL AND expires_at>? AND attempts<5 RETURNING id").bind(now,id,profileId,codeHash,now).first();
  if(!claimed) {
    await db().prepare("UPDATE owner_login_codes SET attempts=attempts+1,consumed_at=CASE WHEN attempts+1>=5 THEN ? ELSE NULL END WHERE id=? AND profile_id=? AND code_hash<>? AND ready=1 AND consumed_at IS NULL AND expires_at>? AND attempts<5").bind(now,id,profileId,codeHash,now).run();
    throw invalidCode();
  }
  const grantToken=randomHex(),expiresAt=now+GRANT_TTL;
  await db().batch([
    db().prepare("INSERT INTO owner_bindings(profile_id,created_at,verified_at) VALUES(?,?,?) ON CONFLICT(profile_id) DO UPDATE SET verified_at=excluded.verified_at").bind(profileId,now,now),
    db().prepare("INSERT INTO owner_login_grants(token_hash,profile_id,created_at,expires_at) VALUES(?,?,?,?)").bind(await digest("grant:"+profileId+":"+grantToken),profileId,now,expiresAt),
    db().prepare("UPDATE profiles SET nickname='沈佳乐',star='Leo' WHERE id=?").bind(profileId)]);
  return {grantToken,expiresAt,visitor:{id:profileId,nickname:"沈佳乐",star:"Leo",knownOwner:true,isOwner:true}};
}
