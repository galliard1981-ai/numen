#!/usr/bin/env python3
"""Numen local server: static app + /r/<code> chip landing + tiny JSON store. Standard library only."""
import json, os, re, socket, sys, threading, time, webbrowser, mimetypes
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, unquote

ROOT = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.join(ROOT, 'web')
DATA = os.path.join(ROOT, 'data', 'notebooks.json')
PORT = int(os.environ.get('NUMEN_PORT', '8765'))
CODE_RE = re.compile(r'^[A-Za-z0-9_-]{3,32}$')
LOCK = threading.Lock()
mimetypes.add_type('video/webm', '.webm')
mimetypes.add_type('application/manifest+json', '.webmanifest')
mimetypes.add_type('text/javascript', '.js')

def load():
    try:
        with open(DATA, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}

def save(d):
    os.makedirs(os.path.dirname(DATA), exist_ok=True)
    tmp = DATA + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=1)
    os.replace(tmp, DATA)

def lan_ips():
    ips = []
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('10.255.255.255', 1))
        ips.append(s.getsockname()[0]); s.close()
    except Exception:
        pass
    try:
        for ip in socket.gethostbyname_ex(socket.gethostname())[2]:
            if not ip.startswith('127.') and ip not in ips:
                ips.append(ip)
    except Exception:
        pass
    return ips

class H(BaseHTTPRequestHandler):
    server_version = 'Numen'
    def log_message(self, *a): pass

    def send_json(self, obj, status=200):
        b = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(b)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        if self.command != 'HEAD': self.wfile.write(b)

    def serve_file(self, path):
        try:
            size = os.path.getsize(path)
        except OSError:
            return self.send_json({'error': 'not found'}, 404)
        ctype = mimetypes.guess_type(path)[0] or 'application/octet-stream'
        if ctype.startswith('text/') or ctype.endswith('json'):
            ctype += '; charset=utf-8'
        start, end, status = 0, size - 1, 200
        rng = self.headers.get('Range')
        if rng:
            m = re.match(r'bytes=(\d*)-(\d*)$', rng.strip())
            if m and (m.group(1) or m.group(2)):
                if m.group(1):
                    start = int(m.group(1))
                    if m.group(2): end = min(int(m.group(2)), size - 1)
                else:
                    start = max(0, size - int(m.group(2)))
                if start > end or start >= size:
                    self.send_response(416); self.send_header('Content-Range', 'bytes */%d' % size); self.end_headers(); return
                status = 206
        length = end - start + 1
        self.send_response(status)
        self.send_header('Content-Type', ctype)
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Length', str(length))
        if status == 206: self.send_header('Content-Range', 'bytes %d-%d/%d' % (start, end, size))
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        if self.command == 'HEAD': return
        try:
            with open(path, 'rb') as f:
                f.seek(start); left = length
                while left > 0:
                    chunk = f.read(min(65536, left))
                    if not chunk: break
                    self.wfile.write(chunk); left -= len(chunk)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass

    def do_HEAD(self): self.do_GET()

    def do_GET(self):
        p = unquote(urlparse(self.path).path)
        if p == '/api/info':
            return self.send_json({'lan': lan_ips(), 'port': PORT})
        m = re.match(r'^/api/nb/([^/]+)$', p)
        if m:
            code = m.group(1)
            if not CODE_RE.match(code): return self.send_json({'error': 'bad code'}, 400)
            with LOCK: nb = load().get(code)
            return self.send_json(nb) if nb else self.send_json({'error': 'not found'}, 404)
        rm = re.match(r'^/r/([A-Za-z0-9_-]{3,32})/?$', p)
        if rm:
            self.send_response(302); self.send_header('Location', '/#/tap/' + rm.group(1)); self.end_headers(); return
        if p == '/':
            return self.serve_file(os.path.join(WEB, 'index.html'))
        full = os.path.normpath(os.path.join(WEB, p.lstrip('/')))
        if not full.startswith(WEB + os.sep) or not os.path.isfile(full):
            return self.send_json({'error': 'not found'}, 404)
        self.serve_file(full)

    def do_DELETE(self):
        p = unquote(urlparse(self.path).path)
        m = re.match(r'^/api/nb/([^/]+)$', p)
        if not m or not CODE_RE.match(m.group(1)): return self.send_json({'error': 'bad code'}, 400)
        with LOCK:
            d = load(); d.pop(m.group(1), None); save(d)
        self.send_json({'ok': True})

    def do_PUT(self):
        p = unquote(urlparse(self.path).path)
        m = re.match(r'^/api/nb/([^/]+)$', p)
        if not m or not CODE_RE.match(m.group(1)): return self.send_json({'error': 'bad code'}, 400)
        try:
            n = int(self.headers.get('Content-Length', '0'))
            if n <= 0 or n > 20000: raise ValueError
            obj = json.loads(self.rfile.read(n).decode('utf-8'))
            nb = {'title': str(obj.get('title', ''))[:80], 'preset': str(obj.get('preset', 'calendar'))[:20],
                  'cfg': {str(k)[:20]: str(v)[:500] for k, v in (obj.get('cfg') or {}).items()}, 'updated': int(time.time())}
        except Exception:
            return self.send_json({'error': 'bad body'}, 400)
        with LOCK:
            d = load(); d[m.group(1)] = nb; save(d)
        self.send_json(nb)

    do_POST = do_PUT

def main():
    try:
        srv = ThreadingHTTPServer(('0.0.0.0', PORT), H)
    except OSError:
        print('Port %d is busy. If Numen is already running, just open http://localhost:%d' % (PORT, PORT))
        webbrowser.open('http://localhost:%d' % PORT)
        return
    print('\n  Numen is running.\n')
    print('  On this computer:  http://localhost:%d' % PORT)
    for ip in lan_ips():
        print('  On your phone:     http://%s:%d   (same Wi-Fi)' % (ip, PORT))
    print('\n  Close this window to stop.\n')
    if '--no-browser' not in sys.argv:
        threading.Timer(0.8, lambda: webbrowser.open('http://localhost:%d' % PORT)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass

if __name__ == '__main__':
    main()
