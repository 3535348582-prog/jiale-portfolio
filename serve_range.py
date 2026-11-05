#!/usr/bin/env python3
"""Range-capable local server for the portfolio (fixes video seeking)."""
import argparse, os, re, sys, threading, http.client
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent

class _LimitedReader:
    def __init__(self, f, n):
        self.f, self.n = f, n
    def read(self, size=-1):
        if self.n <= 0:
            return b''
        if size is None or size < 0 or size > self.n:
            size = self.n
        data = self.f.read(size)
        self.n -= len(data)
        return data
    def close(self):
        self.f.close()

class RangeHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()
        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(404, 'File not found')
            return None
        size = os.fstat(f.fileno()).st_size
        ctype = self.guess_type(path)
        rng = self.headers.get('Range')
        if rng:
            m = re.match(r'bytes=(\d*)-(\d*)$', rng.strip())
            if m:
                start = int(m.group(1)) if m.group(1) else 0
                end = int(m.group(2)) if m.group(2) else size - 1
                start, end = max(0, start), min(size - 1, end)
                if start > end:
                    self.send_error(416, 'Requested Range Not Satisfiable')
                    f.close()
                    return None
                self.send_response(206)
                self.send_header('Content-Type', ctype)
                self.send_header('Accept-Ranges', 'bytes')
                self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
                self.send_header('Content-Length', str(end - start + 1))
                self.end_headers()
                f.seek(start)
                return _LimitedReader(f, end - start + 1)
        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Length', str(size))
        self.end_headers()
        return f

def selftest():
    dist = ROOT / 'dist'
    srv = ThreadingHTTPServer(('127.0.0.1', 0), partial(RangeHandler, directory=str(dist)))
    port = srv.server_address[1]
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    try:
        conn = http.client.HTTPConnection('127.0.0.1', port, timeout=10)
        conn.request('GET', '/assets/box-showreel-original-voice.mp4', headers={'Range': 'bytes=100-199'})
        resp = conn.getresponse()
        body = resp.read()
        print('status', resp.status)
        print('content-range', resp.getheader('Content-Range'))
        print('accept-ranges', resp.getheader('Accept-Ranges'))
        print('body-bytes', len(body))
        ok = resp.status == 206 and len(body) == 100 and 'bytes 100-199/' in (resp.getheader('Content-Range') or '')
        print('PASS' if ok else 'FAIL')
        conn.close()
        return 0 if ok else 1
    finally:
        srv.shutdown()

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--port', type=int, default=8789)
    ap.add_argument('--bind', default='0.0.0.0')
    ap.add_argument('--selftest', action='store_true')
    args = ap.parse_args()
    if args.selftest:
        sys.exit(selftest())
    dist = ROOT / 'dist'
    srv = ThreadingHTTPServer((args.bind, args.port), partial(RangeHandler, directory=str(dist)))
    print(f'Serving {dist} on http://{args.bind}:{args.port}/ (Range enabled)', flush=True)
    srv.serve_forever()
