"""
Timeline & Audit Logs Lambda Handlers for RESQ-CLOUD.
Provides accountability audit trail and reallocation story timeline.
"""

from .common import success_response, get_path_param, get_query_param
from .. import db

def timeline_handler(event, context):
    raw_path = event.get("rawPath") or event.get("path", "")
    disaster_id = get_path_param(event, "id") or get_query_param(event, "disasterId")
    events = db.get_timeline(disaster_id=disaster_id)
    return success_response(events)

def audit_handler(event, context):
    logs = db.get_audit_logs()
    return success_response(logs)
