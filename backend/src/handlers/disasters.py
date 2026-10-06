"""
Disasters Lambda Handler for RESQ-CLOUD.
Implements disaster lifecycle and affected area associations.
"""

from datetime import datetime
from .common import success_response, error_response, parse_body, get_path_param
from .. import db

def handler(event, context):
    http_method = event.get("requestContext", {}).get("http", {}).get("method") or event.get("httpMethod", "GET")
    raw_path = event.get("rawPath") or event.get("path", "")
    
    # 1. GET /disasters or GET /dashboard/stats
    if "/dashboard/stats" in raw_path:
        disasters = db.get_disasters()
        areas = db.get_areas()
        allocations = db.get_allocations()
        
        active_disasters = len([d for d in disasters if d.get("status") == "active"])
        total_pop = sum(d.get("affectedPopulation", 0) for d in disasters)
        critical_areas = len([a for a in areas if a.get("severity") == "critical" or a.get("status") == "critical"])
        pending_allocations = len([a for a in allocations if a.get("approvalStatus") in ["recommended", "pending_approval"]])
        
        return success_response({
            "activeDisasters": active_disasters,
            "totalAffectedPop": total_pop,
            "criticalAreas": critical_areas,
            "pendingAllocations": pending_allocations,
        })

    disaster_id = get_path_param(event, "id") or (raw_path.split("/")[2] if len(raw_path.split("/")) > 2 and raw_path.split("/")[2] not in ["", "areas", "stats"] else None)

    # 2. Areas under a disaster: GET/POST /disasters/{id}/areas
    if "/areas" in raw_path and disaster_id:
        if http_method == "GET":
            areas = db.get_areas(disaster_id=disaster_id)
            return success_response(areas)
        elif http_method == "POST":
            body = parse_body(event)
            if not body.get("name"):
                return error_response("Area name is required", 400)
            area_id = f"AREA-{int(datetime.utcnow().timestamp())}"
            new_area = {
                "id": area_id,
                "disasterId": disaster_id,
                **body,
            }
            created = db.put_area(new_area)
            db.log_audit("Admin", "Administrator", "AREA_CREATED", "Area", area_id, "success", f"Added area {body.get('name')}")
            return success_response(created, 201)

    # 3. Individual disaster: GET/PATCH /disasters/{id}
    if disaster_id:
        disaster = db.get_disaster(disaster_id)
        if not disaster:
            return error_response(f"Disaster {disaster_id} not found", 404)
            
        if http_method == "GET":
            return success_response(disaster)
        elif http_method in ["PATCH", "PUT"]:
            updates = parse_body(event)
            updated = db.put_disaster({**disaster, **updates, "lastUpdate": datetime.utcnow().isoformat() + "Z"})
            db.log_audit("Admin", "Administrator", "DISASTER_UPDATED", "Disaster", disaster_id, "success", f"Updated disaster {disaster.get('name')}")
            return success_response(updated)

    # 4. Collection: GET /disasters or POST /disasters
    if http_method == "GET":
        disasters = db.get_disasters()
        return success_response(disasters)
    elif http_method == "POST":
        body = parse_body(event)
        name = body.get("name")
        if not name:
            return error_response("Disaster name is required", 400)
            
        new_id = f"DIS-{int(datetime.utcnow().timestamp())}"
        now_str = datetime.utcnow().isoformat() + "Z"
        new_disaster = {
            "id": new_id,
            "name": name,
            "type": body.get("type", "flood"),
            "location": body.get("location", "Tamil Nadu"),
            "state": body.get("state", "Tamil Nadu"),
            "severity": body.get("severity", "high"),
            "severityScore": float(body.get("severityScore", 8.0)),
            "affectedPopulation": int(body.get("affectedPopulation", 10000)),
            "status": body.get("status", "active"),
            "startDate": body.get("startDate", now_str),
            "lastUpdate": now_str,
            "description": body.get("description", ""),
            "coordinates": body.get("coordinates", [12.9165, 79.1325]),
        }
        created = db.put_disaster(new_disaster)
        db.log_audit("Admin", "Administrator", "DISASTER_CREATED", "Disaster", new_id, "success", f"Declared disaster {name}")
        return success_response(created, 201)

    return error_response("Method not allowed", 405)
