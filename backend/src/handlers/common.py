"""
Common utilities for AWS Lambda HTTP API handlers.
Provides standard JSON responses, CORS headers, error handling, and parameter parsing.
"""

import json
from typing import Any, Dict

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Amz-Date, X-Api-Key",
}

def success_response(data: Any, status_code: int = 200) -> Dict[str, Any]:
    """Generates standard HTTP API 2xx response."""
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(data),
    }

def error_response(message: str, status_code: int = 400, code: str = "BAD_REQUEST") -> Dict[str, Any]:
    """Generates standard HTTP API error response."""
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps({"error": message, "code": code}),
    }

def parse_body(event: Dict[str, Any]) -> Dict[str, Any]:
    """Extracts JSON payload from API Gateway event body."""
    body = event.get("body")
    if not body:
        return {}
    if isinstance(body, dict):
        return body
    try:
        return json.loads(body)
    except Exception:
        return {}

def get_path_param(event: Dict[str, Any], name: str, default: str = "") -> str:
    """Extracts path parameter from API Gateway HTTP API event."""
    params = event.get("pathParameters") or {}
    return params.get(name, default)

def get_query_param(event: Dict[str, Any], name: str, default: str = "") -> str:
    """Extracts query string parameter from API Gateway HTTP API event."""
    params = event.get("queryStringParameters") or {}
    return params.get(name, default)
