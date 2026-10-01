import functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = r"C:\Users\mirik\Desktop\1\проекты\сайт t1"

class H(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".svg": "image/svg+xml; charset=utf-8",
    }

    def log_message(self, *args):
        pass

if __name__ == "__main__":
    srv = ThreadingHTTPServer(("127.0.0.1", 8000),
                              functools.partial(H, directory=ROOT))
    print("t1 on http://localhost:8000", flush=True)
    srv.serve_forever()
