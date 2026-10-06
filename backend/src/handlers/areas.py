"""
Areas Lambda Handler for RESQ-CLOUD.
Implements field conditions reporting and triggers reallocation checks.
"""

from .common import success_response, error_response, parse_body, get_path_param, get_query_param
from .. import db
from ..engines.reallocation import trigger_reallocation

def handler(event, context):
    http_method = event.get("requestContext", {}).get("http", {}).get("method") or event.get("httpMethod", "GET")
    raw_path = event.get("rawPath") or event.get("path", "")
    
    area_id = get_path_param(event, "id") or (raw_path.split("/")[-1] if len(raw_path.split("/")) > 2 and raw_path.split("/")[-1] != "areas" else None)

    if area_id:
        area = db.get_area(area_id)
        if not area:
            return error_response(f"Area {area_id} not found", 404)

        if http_method == "GET":
            return success_response(area)
        elif http_method in ["PATCH", "PUT"]:
            updates = parse_body(event)
            updated = db.update_area(area_id, updates)
            db.log_audit("Field Officer", "Field Officer", "AREA_UPDATED", "Area", area_id, "success", f"Field update on {area.get('name')}")

            # Check if this update triggers a reallocation
            urgency_changed = "medicalUrgency" in updates or "severity" in updates or "accessibility" in updates
            if urgency_changed:
                all_areas = db.get_areas(disaster_id=area.get("disasterId"))
                all_warehouses = db.get_warehouses()
                all_requests = db.get_requests()
                all_allocations = db.get_allocations()

                realloc_res = trigger_reallocation(
                    trigger_type="area_condition_change",
                    details=f"Field condition change reported in {area.get('name')}",
                    areas=all_areas,
                    warehouses=all_warehouses,
                    existing_requests=all_requests,
                    existing_allocations=all_allocations,
                )
                db.add_timeline_event(realloc_res["timeline_event"])
                return success_response({
                    "area": updated,
                    "reallocation": realloc_res,
                })

            return success_response(updated)

    if http_method == "GET":
        disaster_id = get_query_param(event, "disasterId")
        areas = db.get_areas(disaster_id=disaster_id if disaster_id else None)
        return success_response(areas)

    return error_response("Method not allowed", 405)
