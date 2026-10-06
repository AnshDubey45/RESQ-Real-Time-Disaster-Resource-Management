"""
Priorities Lambda Handler for RESQ-CLOUD.
Executes the multi-factor Priority Engine across areas in a disaster zone.
"""

from .common import success_response, error_response, get_path_param
from .. import db
from ..engines.priority import rank_affected_areas

def handler(event, context):
    raw_path = event.get("rawPath") or event.get("path", "")
    disaster_id = get_path_param(event, "id") or (raw_path.split("/")[2] if len(raw_path.split("/")) > 2 else "DIS-001")

    areas = db.get_areas(disaster_id=disaster_id)
    if not areas:
        # Fallback to all areas if specific disaster had none
        areas = db.get_areas()

    ranked_areas = rank_affected_areas(areas)
    
    # Save computed priorities back to areas for consistency
    for r in ranked_areas:
        db.update_area(r["id"], {
            "priorityScore": r["priorityScore"],
            "priorityFactors": r["priorityFactors"],
        })

    return success_response({
        "disasterId": disaster_id,
        "totalAreas": len(ranked_areas),
        "priorities": ranked_areas,
    })
