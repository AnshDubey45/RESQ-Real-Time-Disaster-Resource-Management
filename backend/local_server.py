"""
Local Development Server for RESQ-CLOUD Backend.
Simulates AWS API Gateway and Lambda locally on http://localhost:8000.
Enables instant local API testing and frontend integration without deploying to AWS.
"""

import sys
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from src.handlers.router import handler as lambda_router

PORT = 8000

class LocalGatewayHandler(BaseHTTPRequestHandler):
    def _send_lambda_response(self, response):
        status_code = response.get("statusCode", 200)
        headers = response.get("headers", {})
        body = response.get("body", "")

        self.send_response(status_code)
        for k, v in headers.items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body.encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def _dispatch(self, method):
        parsed = urlparse(self.path)
        path = parsed.path
        query_params = {k: v[0] for k, v in parse_qs(parsed.query).items()}

        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b""
        body_str = body_bytes.decode("utf-8") if body_bytes else ""

        # Construct AWS API Gateway v2 HTTP event
        event = {
            "version": "2.0",
            "rawPath": path,
            "rawQueryString": parsed.query,
            "headers": dict(self.headers),
            "queryStringParameters": query_params,
            "requestContext": {
                "http": {
                    "method": method,
                    "path": path,
                }
            },
            "body": body_str,
        }

        try:
            res = lambda_router(event, None)
            self._send_lambda_response(res)
        except Exception as e:
            err_res = {
                "statusCode": 500,
                "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": str(e), "code": "INTERNAL_SERVER_ERROR"}),
            }
            self._send_lambda_response(err_res)

    def do_GET(self):
        self._dispatch("GET")

    def do_POST(self):
        self._dispatch("POST")

    def do_PATCH(self):
        self._dispatch("PATCH")

    def do_PUT(self):
        self._dispatch("PUT")

    def do_DELETE(self):
        self._dispatch("DELETE")

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {args[0]} -> {args[1]}")

def run_server():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, LocalGatewayHandler)
    print(f"🚀 RESQ-CLOUD Local API Server running at http://localhost:{PORT}")
    print(f"   Health check: http://localhost:{PORT}/health")
    print(f"   Disasters:    http://localhost:{PORT}/disasters")
    print(f"   Dashboard:    http://localhost:{PORT}/dashboard/stats")
    print("   Press Ctrl+C to stop.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping local server...")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
