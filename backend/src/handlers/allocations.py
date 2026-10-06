"""
Allocations Lambda Handler for RESQ-CLOUD.
Implements the AI Recommendation -> Human Approval -> Dispatch lifecycle.
"""

from datetime import datetime
from .common import success_response, error_response, parse_body, get_path_param
from .. import db
from ..engines.allocation import allocate_resources
from ..engines.explain import generate_explanation

def handler(event, context):
    http_method = event.get("requestContext", {}).get("http", {}).get("method") or event.get("httpMethod", "GET")
    raw_path = event.get("rawPath") or event.get("path", "")
    
    # 1. Recommendation generation: POST /disasters/{id}/recommendations or POST /recommendations
    if "/recommendations" in raw_path and http_method == "POST":
        requests = db.get_requests()
        warehouses = db.get_warehouses()
        areas = db.get_areas()
        area_map = {a["id"]: a for a in areas}

        result = allocate_resources(requests=requests, warehouses=warehouses)
        recommendations = result["recommendations"]

        # Augment each recommendation with formal explanation
        for rec in recommendations:
            aid = rec["destinationAreaId"]
            area = area_map.get(aid, {"priorityScore": rec["priorityScore"], "name": rec["destinationArea"]})
            exp = generate_explanation(recommendation=rec, area=area, distance_km=rec.get("distanceKm"))
            rec["explanationJson"] = exp
            db.put_allocation(rec)

        db.log_audit(
            user="AI_ENGINE",
            user_role="System",
            action="RECOMMENDATIONS_GENERATED",
            object_type="Allocations",
            object_id="BATCH",
            result="success",
            details=f"Generated {len(recommendations)} candidate allocations. Shortages recorded: {result['shortages']}",
        )

        return success_response({
            "generatedRecommendations": recommendations,
            "shortages": result["shortages"],
            "totalCount": len(recommendations),
        }, 201)

    # 2. Lifecycle operations: /allocations/{id}/approve, /allocations/{id}/reject, /allocations/{id}/dispatch
    alc_id = get_path_param(event, "id") or (raw_path.split("/")[2] if len(raw_path.split("/")) > 2 and raw_path.split("/")[2] not in ["", "recommendations"] else None)

    if alc_id:
        if "/approve" in raw_path:
            body = parse_body(event)
            updated = db.update_allocation(alc_id, {
                "approvalStatus": "approved",
                "approvedBy": body.get("approvedBy", "Administrator (Mission Commander)"),
                "approvedAt": datetime.utcnow().isoformat() + "Z",
            })
            if not updated:
                return error_response(f"Allocation {alc_id} not found", 404)
            db.log_audit(
                user=body.get("approvedBy", "Administrator"),
                user_role="Administrator",
                action="ALLOCATION_APPROVED",
                object_type="Allocation",
                object_id=alc_id,
                result="success",
                details=f"Human authorization confirmed for {updated.get('quantity')} {updated.get('unit')} of {updated.get('resourceType')}",
            )
            return success_response(updated)

        elif "/reject" in raw_path:
            body = parse_body(event)
            reason = body.get("reason", "Operator rejected")
            updated = db.update_allocation(alc_id, {
                "approvalStatus": "rejected",
                "rejectionReason": reason,
            })
            if not updated:
                return error_response(f"Allocation {alc_id} not found", 404)
            db.log_audit(
                user=body.get("user", "Administrator"),
                user_role="Administrator",
                action="ALLOCATION_REJECTED",
                object_type="Allocation",
                object_id=alc_id,
                result="warning",
                details=f"Allocation rejected: {reason}",
            )
            return success_response(updated)

        elif "/dispatch" in raw_path:
            updated = db.update_allocation(alc_id, {
                "approvalStatus": "dispatched",
                "dispatchStatus": "in_transit",
                "dispatchedAt": datetime.utcnow().isoformat() + "Z",
            })
            if not updated:
                return error_response(f"Allocation {alc_id} not found", 404)
            db.log_audit(
                user="Warehouse Manager",
                user_role="Warehouse Manager",
                action="CONVOY_DISPATCHED",
                object_type="Allocation",
                object_id=alc_id,
                result="success",
                details=f"Dispatched delivery convoy from {updated.get('sourceWarehouse')} to {updated.get('destinationArea')}",
            )
            return success_response(updated)

        # GET single allocation
        alc = next((a for a in db.get_allocations() if a["id"] == alc_id), None)
        if alc:
            return success_response(alc)
        return error_response(f"Allocation {alc_id} not found", 404)

    # 3. GET /allocations collection
    if http_method == "GET":
        allocations = db.get_allocations()
        return success_response(allocations)

    return error_response("Method not allowed", 405)
