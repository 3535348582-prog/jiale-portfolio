// Run manually: node scripts/guestbook-regression.mjs https://SERVICE.example
// No credentials in this file. Tokens stay in memory and test comments are
// soft-deleted in finally. Never run --session-race against a production site:
// that optional check deliberately consumes the IP's hourly session allowance.
import assert from 'node:assert/strict';

const input = process.argv[2];
if (!input || input.startsWith('--')) {
  console.log('Usage: node scripts/guestbook-regression.mjs https://SERVICE.example [--session-race]');
  process.exit(0);
}
const endpoint = new URL(input);
assert(['https:', 'http:'].includes(endpoint.protocol), 'HTTP(S) endpoint required');
assert(!endpoint.username && !endpoint.password, 'Do not pass credentials in the URL');
const base = endpoint.origin + '/api/guestbook';
const origin = 'https://jiale-shen-portfolio.surge.sh';
const cleanup = [];
const secretTokens = [];
const marker = 'API检查-' + Date.now().toString(36);
let passed = 0;

async function request(path, { method = 'GET', token, body, raw, requestOrigin = origin } = {}) {
  const headers = { Origin: requestOrigin };
  if (token) headers.Authorization = 'Bearer ' + token;
  if (body !== undefined || raw !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(base + path, {
    method, headers, body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
    redirect: 'error', signal: AbortSignal.timeout(15000),
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; }
  catch { throw new Error(`Non-JSON response for ${method} ${path} (${response.status})`); }
  return { response, data, text };
}
function status(result, expected) {
  assert.equal(result.response.status, expected, `Expected status ${expected}, got ${result.response.status}: ${result.data?.code || 'no error code'}`);
}
function pass(label) { passed++; console.log('PASS ' + label); }
async function list(token) {
  const result = await request('/comments', { token }); status(result, 200);
  assert(Array.isArray(result.data.comments)); assert(result.data.comments.length <= 100);
  assert(!/token_hash|tokenHash/.test(result.text));
  for (const token of secretTokens) assert(!result.text.includes(token), 'Public response must not contain a visitor token');
  return result.data.comments;
}
async function session(nickname, star) {
  const result = await request('/session', { method: 'POST', body: { nickname, star, website: '' } });
  status(result, 201); assert.match(result.data.token, /^[a-f0-9]{64}$/);
  assert.deepEqual(Object.keys(result.data.visitor).sort(), ['id', 'nickname', 'star']);
  secretTokens.push(result.data.token);
  return result.data;
}
async function post(actor, body, parentId = null) {
  const result = await request('/comments', { method: 'POST', token: actor.token, body: { body, parentId, website: '' } });
  status(result, 201); assert.equal(result.data.comment.body, body);
  cleanup.push({ id: result.data.comment.id, token: actor.token });
  return result.data.comment;
}

try {
  const preflight = await request('/comments', { method: 'OPTIONS' });
  status(preflight, 204);
  assert.equal(preflight.response.headers.get('Access-Control-Allow-Origin'), origin);
  assert.match(preflight.response.headers.get('Vary') || '', /Origin/i);
  assert.equal(preflight.response.headers.get('Access-Control-Allow-Credentials'), null);
  assert.match(preflight.response.headers.get('Access-Control-Allow-Headers') || '', /Authorization/i);
  for (const local of ['http://127.0.0.1:8796', 'http://127.0.0.1:8797', 'http://localhost:8796', 'http://localhost:8797']) {
    const result = await request('/comments', { method: 'OPTIONS', requestOrigin: local });
    status(result, 204); assert.equal(result.response.headers.get('Access-Control-Allow-Origin'), local);
  }
  const blocked = await request('/comments', { method: 'OPTIONS', requestOrigin: 'https://untrusted.invalid' });
  status(blocked, 403); assert.equal(blocked.response.headers.get('Access-Control-Allow-Origin'), null);
  pass('CORS preflights, explicit allowlist, no cookies');

  status(await request('/session', { method: 'POST', raw: '{' }), 400);
  status(await request('/session', { method: 'POST', raw: JSON.stringify({ nickname: 'x'.repeat(9000), star: 'Leo' }) }), 400);
  status(await request('/session', { method: 'POST', body: { nickname: marker, star: 'Leo', website: 'bot' } }), 400);
  status(await request('/session', { method: 'POST', body: { nickname: 'x'.repeat(25), star: 'Leo' } }), 400);
  status(await request('/session', { method: 'POST', body: { nickname: marker, star: 'invalid' } }), 400);
  status(await request('/comments', { method: 'POST', body: { body: marker } }), 401);
  status(await request('/comments?cursor=' + 'a'.repeat(300)), 400);
  await list(); pass('Public read, validation, oversized JSON, honeypot, anonymous write rejection');

  const a = await session(marker + 'A', 'Leo');
  const b = await session(marker + 'B', 'Aqr');
  assert.notEqual(a.visitor.id, b.visitor.id); assert.notEqual(a.token, b.token);
  const parent = await post(a, marker + '：主留言 <b>纯文本</b>');
  const reply = await post(b, marker + '：回复 @' + a.visitor.nickname, parent.id);
  assert.equal(reply.parentId, parent.id);
  const publicRows = await list();
  assert(publicRows.some(c => c.id === parent.id && c.body === parent.body));
  assert(publicRows.some(c => c.id === reply.id && c.parentId === parent.id));
  pass('Two anonymous visitors, shared comments, reply relationship, no capability leak');

  const limited = await request('/comments', { method: 'POST', token: a.token, body: { body: marker + 'too soon' } });
  status(limited, 429); assert(Number(limited.response.headers.get('Retry-After')) > 0);
  status(await request('/comments', { method: 'POST', token: a.token, body: { body: 'x'.repeat(1001) } }), 400);
  status(await request('/comments/' + parent.id, { method: 'DELETE', token: b.token }), 403);
  pass('Posting interval, 1000-character limit, owner-only deletion');

  const patch = await request('/session', { method: 'PATCH', token: a.token, body: { nickname: marker + '改', star: 'Vir' } });
  status(patch, 200); assert.equal(patch.data.visitor.star, 'Vir');
  const updated = (await list()).find(c => c.id === parent.id);
  assert.equal(updated.author.nickname, marker + '改'); assert.equal(updated.author.star, 'Vir');
  pass('Profile nickname and constellation update synchronizes public signature');

  const like = () => request('/comments/' + parent.id + '/like', { method: 'POST', token: b.token, body: {} });
  let result = await like(); status(result, 200); assert.equal(result.data.likes, 1); assert.equal(result.data.likedByMe, true);
  result = await like(); status(result, 200); assert.equal(result.data.likes, 0); assert.equal(result.data.likedByMe, false);
  const concurrent = await Promise.all(Array.from({ length: 10 }, like));
  for (const item of concurrent) status(item, 200);
  const after = (await list(b.token)).find(c => c.id === parent.id);
  assert.equal(after.likes, 0); assert.equal(after.likedByMe, false);
  pass('Like/unlike uniqueness and ten concurrent toggles preserve even parity');

  status(await request('/comments/' + parent.id, { method: 'DELETE', token: a.token }), 200);
  const tombstone = (await list()).find(c => c.id === parent.id);
  assert(tombstone?.deleted); assert.equal(tombstone.body, ''); assert.equal(tombstone.likes, 0);
  assert((await list()).some(c => c.id === reply.id));
  status(await like(), 404);
  status(await request('/comments', { method: 'POST', token: a.token, body: { body: marker + 'reply to deleted', parentId: parent.id } }), 404);
  status(await request('/comments/' + reply.id, { method: 'DELETE', token: b.token }), 200);
  const empty = await list();
  assert(!empty.some(c => c.id === parent.id || c.id === reply.id));
  pass('Deleted parent keeps live reply; deleted body hidden; empty deleted thread disappears');

  if (process.argv.includes('--session-race')) {
    console.warn('STAGING ONLY: consuming this IP\'s remaining hourly session allowance.');
    const raced = await Promise.all(Array.from({ length: 12 }, (_, i) => request('/session', { method: 'POST', body: { nickname: marker + i, star: 'Leo' } })));
    assert(raced.filter(r => r.response.status === 201).length <= 8, 'Two existing sessions plus race must not exceed ten creations');
    assert(raced.some(r => r.response.status === 429));
    for (const item of raced) assert([201, 429].includes(item.response.status));
    pass('Concurrent session creation cannot exceed ten per IP/hour');
  }
  console.log(`Completed ${passed} checks. Test comment cleanup follows.`);
} catch (error) {
  console.error('FAIL ' + error.message);
  process.exitCode = 1;
} finally {
  let failed = 0;
  for (const item of cleanup.reverse()) {
    try {
      const result = await request('/comments/' + item.id, { method: 'DELETE', token: item.token });
      if (![200, 404].includes(result.response.status)) failed++;
    } catch { failed++; }
  }
  if (failed) { console.error(`Cleanup incomplete for ${failed} test comments; rerun cleanup before release.`); process.exitCode = 1; }
  else if (cleanup.length) console.log('CLEANUP All test comments soft-deleted. No credentials saved.');
}
