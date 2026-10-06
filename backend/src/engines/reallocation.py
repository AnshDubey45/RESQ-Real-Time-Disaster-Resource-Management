"""
Dynamic Reallocation Engine for RESQ-CLOUD.
Handles condition change triggers (route blockages, warehouse failure, severity escalations)
and computes plan diffs, marking previous un-dispatched recommendations as SUPERSEDED.
"""

from typing import Dict, Any, List
from datetime import datetime
from .priority import rank_affected_areas
from .allocation import allocate_resources

def trigger_reallocation(
    trigger_type: str, # 'area_condition_change' | 'warehouse_blocked' | 'new_request' | 'manual'
    details: str,
    areas: List[Dict[str, Any]],
    warehouses: List[Dict[str, Any]],
    existing_requests: List[Dict[str, Any]],
    existing_allocations: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Reruns priority ranking and allocation for undispatched resources,
    producing an audit-ready plan diff and event timeline entry.
    """
    timestamp = datetime.utcnow().isoformat() + "Z"

    # Separate locked (dispatched / completed) allocations from pending ones
    locked_allocations = [
        a for a in existing_allocations 
        if a.get("approvalStatus") in ["dispatched", "delivered", "completed"] 
        or a.get("dispatchStatus") in ["dispatched", "in_transit", "delivered"]
    ]
    superseded_allocations = [
        a for a in existing_allocations 
        if a not in locked_allocations
    ]

    # Re-rank areas with latest conditions
    reranked_areas = rank_affected_areas(areas)
    area_score_map = {a["id"]: a["priorityScore"] for a in reranked_areas}

    # Update request priority scores based on current area scores
    active_requests = []
    for req in existing_requests:
        req_copy = dict(req)
        aid = req_copy.get("areaId")
        if aid in area_score_map:
            req_copy["priorityScore"] = area_score_map[aid]
        active_requests.append(req_copy)

    # Run fresh allocation
    new_allocation_result = allocate_resources(
        requests=active_requests,
        warehouses=warehouses,
    )
    new_recommendations = new_allocation_result["recommendations"]

    # Calculate plan diff
    diff_summary = {
        "superseded_count": len(superseded_allocations),
        "new_recommendations_count": len(new_recommendations),
        "locked_dispatched_count": len(locked_allocations),
    }

    # Generate timeline event
    timeline_event = {
        "id": f"EVT-{int(datetime.utcnow().timestamp())}",
        "timestamp": timestamp,
        "type": trigger_type,
        "title": f"Dynamic Reallocation Triggered: {trigger_type.replace('_', ' ').title()}",
        "description": details,
        "impact": f"Superseded {len(superseded_allocations)} unapproved allocations; generated {len(new_recommendations)} optimized recommendations.",
    }

    return {
        "timestamp": timestamp,
        "trigger": trigger_type,
        "details": details,
        "timeline_event": timeline_event,
        "diff": diff_summary,
        "reranked_areas": reranked_areas,
        "superseded_allocation_ids": [a["id"] for a in superseded_allocations],
        "new_recommendations": new_recommendations,
        "shortages": new_allocation_result["shortages"],
    }
