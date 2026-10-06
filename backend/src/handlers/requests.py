"""
Resource Requests Lambda Handler for RESQ-CLOUD.
Manages intake of field resource requests with automated priority tagging.
"""

from datetime import datetime
from .common import success_response, error_response, parse_body, get_path_param
from .. import db

def handler(event, context):
    http_method = event.get("requestContext", {}).get("http", {}).get("method") or event.get("httpMethod", "GET")
    raw_path = event.get("rawPath") or event.get("path", "")
    
    req_id = get_path_param(event, "id") or (raw_path.split("/")[-1] if len(raw_path.split("/")) > 2 and raw_path.split("/")[-1] != "requests" else None)

    if req_id:
        req = next((r for r in db.get_requests() if r["id"] == req_id), None)
        if not req:
            return error_response(f"Request {req_id} not found", 404)
        if http_method == "GET":
            return success_response(req)
        elif http_method in ["PATCH", "PUT"]:
            updates = parse_body(event)
            updated = db.update_request(req_id, updates)
            db.log_audit("Operator", "Field Officer", "REQUEST_UPDATED", "ResourceRequest", req_id, "info", f"Updated request {req_id}")
            return success_response(updated)

    if http_method == "GET":
        requests = db.get_requests()
        return success_response(requests)

    elif http_method == "POST":
        body = parse_body(event)
        area_id = body.get("areaId")
        res_type = body.get("resourceType")
        qty = body.get("requestedQuantity")
        if not area_id or not res_type or not qty:
            return error_response("areaId, resourceType, and requestedQuantity are required", 400)

        # Lookup area priority to tag the request
        area = db.get_area(area_id)
        area_name = area.get("name") if area else body.get("areaName", area_id)
        priority_score = float(area.get("priorityScore", 70.0)) if area else 70.0
        disaster_name = area.get("disasterName", "Current Disaster") if area else "Current Disaster"

        new_req_id = f"REQ-{int(datetime.utcnow().timestamp())}"
        new_request = {
            "id": new_req_id,
            "areaId": area_id,
            "areaName": area_name,
            "disasterName": disaster_name,
            "resourceType": res_type,
            "requestedQuantity": int(qty),
            "unit": body.get("unit", "units"),
            "urgency": body.get("urgency", "medium"),
            "status": "pending",
            "requestedAt": datetime.utcnow().isoformat() + "Z",
            "priorityScore": priority_score,
            "notes": body.get("notes", ""),
        }
        created = db.put_request(new_request)
        db.log_audit("Field Officer", "Field Officer", "REQUEST_SUBMITTED", "ResourceRequest", new_req_id, "success", f"Requested {qty} {res_type} for {area_name}")
        return success_response(created, 201)

    return error_response("Method not allowed", 405)
