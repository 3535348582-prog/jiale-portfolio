// Exercise the production request handlers with a stub environment: no HTTP,
// no database access, no account creation, and no comments are written.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = (await readFile(new URL('../lib/guestbook-server.ts', import.meta.url), 'utf8'))
  .replace('import { env } from "cloudflare:workers";', 'const env = {};');
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const api = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));
const host = 'https://service.test';
const origins = ['https://jiale-shen-portfolio.surge.sh', 'http://127.0.0.1:8796', 'http://127.0.0.1:8797', 'http://localhost:8796', 'http://localhost:8797'];
for (const origin of origins) {
  let called = false;
  const request = new Request(host + '/api/guestbook/comments', { method: 'OPTIONS', headers: { Origin: origin } });
  const response = await api.handle(request, async () => { called = true; });
  assert.equal(response.status, 204);
  assert.equal(called, false);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal(response.headers.get('Access-Control-Allow-Credentials'), null);
  assert.match(response.headers.get('Vary'), /Origin/);
  assert.match(response.headers.get('Access-Control-Allow-Headers'), /Authorization/);
}
for (const origin of ['https://evil.test', 'null', host, 'http://127.0.0.1:8794']) {
  let called = false;
  const request = new Request(host + '/api/guestbook/comments', { method: 'OPTIONS', headers: { Origin: origin } });
  const response = await api.handle(request, async () => { called = true; });
  assert.equal(response.status, 403);
  assert.equal(called, false);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
}
console.log('PASS production CORS handlers: five allowed origins; others blocked before action; no credentials');

for (const body of ['{', 'null', '[]', JSON.stringify({ website: 'filled' }), JSON.stringify({ body: 'x'.repeat(9000) })]) {
  const request = new Request(host, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origins[0] }, body });
  const response = await api.handle(request, () => api.payload(request));
  assert.equal(response.status, 400);
}
const valid = new Request(host, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"body":"<b>literal</b>","website":""}' });
assert.deepEqual(await api.payload(valid), { body: '<b>literal</b>', website: '' });
const wrongType = new Request(host, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: '{}' });
assert.equal((await api.handle(wrongType, () => api.payload(wrongType))).status, 415);
console.log('PASS production payload handler: malformed/array/null/oversized/honeypot rejected; plain text preserved');

const noAuth = new Request(host + '/api/guestbook/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"body":"test"}' });
assert.equal((await api.handle(noAuth, () => api.createComment(noAuth))).status, 401);
const invalidCursor = new Request(host + '/api/guestbook/comments?cursor=' + 'a'.repeat(300));
assert.equal((await api.handle(invalidCursor, () => api.listComments(invalidCursor))).status, 400);
console.log('PASS production auth/cursor validation before database access');
