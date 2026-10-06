"""
Master Gateway Dispatcher Lambda Handler for RESQ-CLOUD.
Routes API Gateway HTTP requests to specific domain handlers.
Supports unified single-function deployment or modular multi-lambda configurations.
"""

from .common import error_response
from .health import handler as health_handler
from .disasters import handler as disasters_handler
from .areas import handler as areas_handler
from .warehouses import handler as warehouses_handler
from .requests import handler as requests_handler
from .priorities import handler as priorities_handler
from .allocations import handler as allocations_handler
from .predictions import handler as predictions_handler
from .simulations import handler as simulations_handler
from .timeline import timeline_handler, audit_handler

def handler(event, context):
    raw_path = event.get("rawPath") or event.get("path", "/")
    
    if raw_path == "/health" or raw_path == "/":
        return health_handler(event, context)
    
    if raw_path.startswith("/disasters") or raw_path.startswith("/dashboard"):
        if "/priorities" in raw_path:
            return priorities_handler(event, context)
        if "/recommendations" in raw_path:
            return allocations_handler(event, context)
        if "/predictions" in raw_path:
            return predictions_handler(event, context)
        if "/timeline" in raw_path:
            return timeline_handler(event, context)
        return disasters_handler(event, context)

    if raw_path.startswith("/areas"):
        return areas_handler(event, context)

    if raw_path.startswith("/warehouses") or raw_path.startswith("/inventory"):
        return warehouses_handler(event, context)

    if raw_path.startswith("/requests"):
        return requests_handler(event, context)

    if raw_path.startswith("/allocations"):
        return allocations_handler(event, context)

    if raw_path.startswith("/predictions") or raw_path.startswith("/model"):
        return predictions_handler(event, context)

    if raw_path.startswith("/simulations"):
        return simulations_handler(event, context)

    if raw_path.startswith("/audit-logs"):
        return audit_handler(event, context)

    if raw_path.startswith("/timeline"):
        return timeline_handler(event, context)

    return error_response(f"Endpoint not found: {raw_path}", 404, "NOT_FOUND")
