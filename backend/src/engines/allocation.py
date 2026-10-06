"""
Allocation Engine for RESQ-CLOUD.
Implements priority-ordered greedy allocation with distance constraints,
operational status checks, and mandatory emergency reserve buffers.
"""

import math
from typing import Dict, Any, List, Tuple
from datetime import datetime

def haversine_distance(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """
    Calculate the great-circle distance between two points on the Earth (in km).
    coord is (latitude, longitude).
    """
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    
    r = 6371.0 # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 2)

def allocate_resources(
    requests: List[Dict[str, Any]],
    warehouses: List[Dict[str, Any]],
    reserve_percent: float = 0.10, # 10% emergency reserve
) -> Dict[str, Any]:
    """
    Greedy allocation algorithm that sorts requests by priority score descending.
    Respects warehouse operational status, route clearance, and reserve floors.
    Works entirely on working copies; does not mutate input state.
    """
    # Create working inventory map: warehouse_id -> { resource_type: { total, available, reserved, reserve_floor } }
    working_stock: Dict[str, Dict[str, Dict[str, float]]] = {}
    warehouse_map: Dict[str, Dict[str, Any]] = {}

    for wh in warehouses:
        wid = str(wh.get("id"))
        warehouse_map[wid] = wh
        working_stock[wid] = {}
        
        resources = wh.get("resources", [])
        for res in resources:
            rtype = res.get("resourceType")
            total = float(res.get("available", 0) + res.get("reserved", 0))
            curr_avail = float(res.get("available", 0))
            curr_resv = float(res.get("reserved", 0))
            floor = round(total * reserve_percent, 2)
            
            working_stock[wid][rtype] = {
                "total": total,
                "available": max(0.0, curr_avail - floor), # allocatable above floor
                "reserved": curr_resv,
                "reserve_floor": floor,
                "unit": res.get("unit", "units"),
            }

    # Sort requests by priorityScore (descending), then urgency, then date
    def request_sort_key(req):
        score = float(req.get("priorityScore", 0.0))
        urgency_weight = {"critical": 4, "high": 3, "medium": 2, "low": 1}.get(
            str(req.get("urgency", "medium")).lower(), 2
        )
        created_at = req.get("requestedAt", "")
        return (score, urgency_weight, created_at)

    sorted_requests = sorted(requests, key=request_sort_key, reverse=True)

    recommendations: List[Dict[str, Any]] = []
    shortages: Dict[str, float] = {}

    for req in sorted_requests:
        req_id = str(req.get("id"))
        area_id = str(req.get("areaId"))
        area_name = str(req.get("areaName", area_id))
        res_type = str(req.get("resourceType"))
        needed = float(req.get("requestedQuantity", 0))
        unit = str(req.get("unit", "units"))
        priority_score = float(req.get("priorityScore", 50.0))
        area_coords = req.get("coordinates") or (12.9165, 79.1325) # Default coordinates if missing

        # Find candidate warehouses:
        # 1. Operational status != 'offline'
        # 2. Route status != 'blocked'
        # 3. Has available stock > 0 for this resource
        candidates = []
        for wid, wh in warehouse_map.items():
            if wh.get("operationalStatus") == "offline":
                continue
            if wh.get("routeStatus") == "blocked":
                continue
            
            stock_info = working_stock[wid].get(res_type)
            if not stock_info or stock_info["available"] <= 0:
                continue
            
            wh_coords = wh.get("coordinates") or (12.9165, 79.1325)
            dist = haversine_distance(area_coords, wh_coords)
            candidates.append({
                "warehouse": wh,
                "distance_km": dist,
                "available": stock_info["available"],
            })

        # Sort candidate warehouses by distance (nearest first)
        candidates.sort(key=lambda c: c["distance_km"])

        allocated_for_req = 0.0
        for cand in candidates:
            if needed <= 0:
                break
            
            wh = cand["warehouse"]
            wid = str(wh.get("id"))
            stock_info = working_stock[wid][res_type]
            
            take = min(needed, stock_info["available"])
            if take > 0:
                stock_info["available"] -= take
                stock_info["reserved"] += take
                needed -= take
                allocated_for_req += take

                rec_id = f"REC-{req_id}-{wid[:4]}-{int(take)}"
                recommendations.append({
                    "id": rec_id,
                    "requestId": req_id,
                    "sourceWarehouse": wh.get("name"),
                    "sourceWarehouseId": wid,
                    "destinationArea": area_name,
                    "destinationAreaId": area_id,
                    "resourceType": res_type,
                    "quantity": int(take) if take.is_integer() else round(take, 1),
                    "unit": unit,
                    "priorityScore": priority_score,
                    "aiRecommendation": True,
                    "aiConfidence": min(98, max(75, int(95 - (cand["distance_km"] * 0.1)))),
                    "approvalStatus": "recommended",
                    "dispatchStatus": "pending",
                    "distanceKm": cand["distance_km"],
                    "estimatedDelivery": f"{max(1, int(cand['distance_km'] / 40 + 1))}h",
                    "createdAt": datetime.utcnow().isoformat() + "Z",
                    "explanation": f"Allocated {int(take)} {unit} from {wh.get('name')} ({cand['distance_km']} km away) prioritizing priority score {priority_score:.1f}.",
                })

        if needed > 0:
            shortages[res_type] = shortages.get(res_type, 0.0) + needed

    return {
        "recommendations": recommendations,
        "shortages": shortages,
        "working_stock": working_stock,
        "reserve_percent": reserve_percent,
        "total_allocated": len(recommendations),
    }
