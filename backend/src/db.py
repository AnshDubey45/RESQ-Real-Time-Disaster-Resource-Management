"""
DynamoDB Database Access Layer for RESQ-CLOUD.
Interacts with AWS DynamoDB tables with automatic fallback to local memory state
for local dev, offline demos, and test suites.
"""

import os
import json
from decimal import Decimal
from datetime import datetime
from typing import Dict, Any, List, Optional
import boto3
from botocore.exceptions import ClientError, BotoCoreError

# DynamoDB table names from environment or defaults
DISASTERS_TABLE = os.environ.get("DISASTERS_TABLE", "resq-disasters")
AREAS_TABLE = os.environ.get("AREAS_TABLE", "resq-areas")
WAREHOUSES_TABLE = os.environ.get("WAREHOUSES_TABLE", "resq-warehouses")
REQUESTS_TABLE = os.environ.get("REQUESTS_TABLE", "resq-requests")
ALLOCATIONS_TABLE = os.environ.get("ALLOCATIONS_TABLE", "resq-allocations")
AUDIT_TABLE = os.environ.get("AUDIT_TABLE", "resq-audit-logs")
TIMELINE_TABLE = os.environ.get("TIMELINE_TABLE", "resq-timeline")
SIMULATIONS_TABLE = os.environ.get("SIMULATIONS_TABLE", "resq-simulations")

AWS_REGION = os.environ.get("AWS_REGION", "ap-south-1")

def _init_dynamodb():
    try:
        return boto3.resource("dynamodb", region_name=AWS_REGION)
    except Exception:
        return None

_DYNAMODB = _init_dynamodb()

def convert_to_dynamo(item: Any) -> Any:
    """Recursively convert float to Decimal for DynamoDB compliance."""
    if isinstance(item, float):
        return Decimal(str(round(item, 4)))
    elif isinstance(item, dict):
        return {k: convert_to_dynamo(v) for k, v in item.items()}
    elif isinstance(item, list):
        return [convert_to_dynamo(v) for v in item]
    return item

def convert_from_dynamo(item: Any) -> Any:
    """Recursively convert Decimal back to int or float for JSON serialization."""
    if isinstance(item, Decimal):
        if item % 1 == 0:
            return int(item)
        return float(item)
    elif isinstance(item, dict):
        return {k: convert_from_dynamo(v) for k, v in item.items()}
    elif isinstance(item, list):
        return [convert_from_dynamo(v) for v in item]
    return item

# ==========================================
# IN-MEMORY SEED DATA FOR LOCAL DEV / FALLBACK
# ==========================================
_FALLBACK_DISASTERS = [
    {
        "id": "DIS-001",
        "name": "Vellore Monsoon Flash Flood",
        "type": "flood",
        "location": "Palar River Basin, Vellore District",
        "state": "Tamil Nadu",
        "severity": "critical",
        "severityScore": 9.2,
        "affectedPopulation": 142500,
        "status": "active",
        "startDate": "2026-10-02T04:30:00Z",
        "lastUpdate": "2026-10-06T06:00:00Z",
        "description": "Severe flooding following torrential monsoon discharge. Multiple low-lying residential sectors inundated.",
        "coordinates": [12.9165, 79.1325],
    },
    {
        "id": "DIS-002",
        "name": "Cyclone Vardah Surge",
        "type": "cyclone",
        "location": "North Coastal Corridor, Chennai-Tiruvallur",
        "state": "Tamil Nadu",
        "severity": "high",
        "severityScore": 7.8,
        "affectedPopulation": 88000,
        "status": "active",
        "startDate": "2026-10-04T12:00:00Z",
        "lastUpdate": "2026-10-06T05:30:00Z",
        "description": "Category 3 coastal cyclone resulting in downed transmission lines and harbor surge.",
        "coordinates": [13.0827, 80.2707],
    },
    {
        "id": "DIS-003",
        "name": "Ranipet Seismic Tremor",
        "type": "earthquake",
        "location": "Ranipet-Walajah Industrial Belt",
        "state": "Tamil Nadu",
        "severity": "medium",
        "severityScore": 5.4,
        "affectedPopulation": 24000,
        "status": "monitoring",
        "startDate": "2026-10-05T09:15:00Z",
        "lastUpdate": "2026-10-06T04:45:00Z",
        "description": "Moderate tremor (Magnitude 4.6). Minor structural cracking observed in older industrial masonry.",
        "coordinates": [12.9272, 79.3330],
    },
]

_FALLBACK_AREAS = [
    {
        "id": "AREA-001",
        "name": "Katpadi North Sector",
        "disasterId": "DIS-001",
        "disasterName": "Vellore Monsoon Flash Flood",
        "population": 38400,
        "severity": "critical",
        "severityScore": 9.5,
        "medicalUrgency": 92.0,
        "accessibility": 25.0, # Highly inaccessible
        "predictedDemand": {"Water": 45000, "Food Packets": 28000, "Medicine": 1800, "Shelter Kits": 650},
        "currentResources": {"Water": 12000, "Food Packets": 8500, "Medicine": 320, "Shelter Kits": 110},
        "shortage": {"Water": 33000, "Food Packets": 19500, "Medicine": 1480, "Shelter Kits": 540},
        "priorityScore": 91.4,
        "priorityFactors": {"severity": 95.0, "populationImpact": 88.0, "medicalUrgency": 92.0, "resourceShortage": 89.0, "accessibility": 75.0},
        "status": "critical",
        "coordinates": [12.9689, 79.1368],
        "warnings": ["Submerged road access along NH-75", "Primary Health Center backup generator submerged"],
    },
    {
        "id": "AREA-002",
        "name": "Thorapadi Riverside",
        "disasterId": "DIS-001",
        "disasterName": "Vellore Monsoon Flash Flood",
        "population": 22100,
        "severity": "critical",
        "severityScore": 8.9,
        "medicalUrgency": 85.0,
        "accessibility": 40.0,
        "predictedDemand": {"Water": 28000, "Food Packets": 18000, "Medicine": 950, "Shelter Kits": 420},
        "currentResources": {"Water": 9500, "Food Packets": 6000, "Medicine": 210, "Shelter Kits": 90},
        "shortage": {"Water": 18500, "Food Packets": 12000, "Medicine": 740, "Shelter Kits": 330},
        "priorityScore": 84.8,
        "priorityFactors": {"severity": 89.0, "populationImpact": 72.0, "medicalUrgency": 85.0, "resourceShortage": 82.0, "accessibility": 60.0},
        "status": "critical",
        "coordinates": [12.8950, 79.1120],
        "warnings": ["River water breached containment dyke"],
    },
    {
        "id": "AREA-003",
        "name": "Sathuvachari Zone 4",
        "disasterId": "DIS-001",
        "disasterName": "Vellore Monsoon Flash Flood",
        "population": 46500,
        "severity": "high",
        "severityScore": 7.4,
        "medicalUrgency": 68.0,
        "accessibility": 70.0,
        "predictedDemand": {"Water": 48000, "Food Packets": 32000, "Medicine": 1100, "Shelter Kits": 300},
        "currentResources": {"Water": 25000, "Food Packets": 18000, "Medicine": 650, "Shelter Kits": 180},
        "shortage": {"Water": 23000, "Food Packets": 14000, "Medicine": 450, "Shelter Kits": 120},
        "priorityScore": 74.2,
        "priorityFactors": {"severity": 74.0, "populationImpact": 82.0, "medicalUrgency": 68.0, "resourceShortage": 65.0, "accessibility": 30.0},
        "status": "high",
        "coordinates": [12.9290, 79.1650],
        "warnings": ["High-voltage lines isolated for safety"],
    },
    {
        "id": "AREA-004",
        "name": "Bagayam Camp",
        "disasterId": "DIS-001",
        "disasterName": "Vellore Monsoon Flash Flood",
        "population": 35500,
        "severity": "medium",
        "severityScore": 6.0,
        "medicalUrgency": 55.0,
        "accessibility": 85.0,
        "predictedDemand": {"Water": 32000, "Food Packets": 21000, "Medicine": 800, "Shelter Kits": 150},
        "currentResources": {"Water": 22000, "Food Packets": 16000, "Medicine": 520, "Shelter Kits": 120},
        "shortage": {"Water": 10000, "Food Packets": 5000, "Medicine": 280, "Shelter Kits": 30},
        "priorityScore": 61.5,
        "priorityFactors": {"severity": 60.0, "populationImpact": 65.0, "medicalUrgency": 55.0, "resourceShortage": 45.0, "accessibility": 15.0},
        "status": "medium",
        "coordinates": [12.8720, 79.1340],
        "warnings": [],
    },
]

_FALLBACK_WAREHOUSES = [
    {
        "id": "WH-001",
        "name": "Vellore Central Depot",
        "location": "Katpadi Logistics Park",
        "coordinates": [12.9750, 79.1410],
        "capacity": 250000,
        "usedCapacity": 172000,
        "operationalStatus": "operational",
        "routeStatus": "clear",
        "resources": [
            {"resourceType": "Water", "available": 85000, "reserved": 15000, "unit": "litres", "stockStatus": "healthy"},
            {"resourceType": "Food Packets", "available": 52000, "reserved": 8000, "unit": "packets", "stockStatus": "healthy"},
            {"resourceType": "Medicine", "available": 3400, "reserved": 600, "unit": "kits", "stockStatus": "healthy"},
            {"resourceType": "Shelter Kits", "available": 1800, "reserved": 200, "unit": "kits", "stockStatus": "healthy"},
        ],
    },
    {
        "id": "WH-002",
        "name": "Ranipet Regional Hub",
        "location": "SIPCOT Phase 2, Ranipet",
        "coordinates": [12.9350, 79.3280],
        "capacity": 200000,
        "usedCapacity": 145000,
        "operationalStatus": "operational",
        "routeStatus": "clear",
        "resources": [
            {"resourceType": "Water", "available": 62000, "reserved": 12000, "unit": "litres", "stockStatus": "healthy"},
            {"resourceType": "Food Packets", "available": 38000, "reserved": 6000, "unit": "packets", "stockStatus": "healthy"},
            {"resourceType": "Medicine", "available": 2100, "reserved": 400, "unit": "kits", "stockStatus": "healthy"},
            {"resourceType": "Shelter Kits", "available": 950, "reserved": 150, "unit": "kits", "stockStatus": "warning"},
        ],
    },
    {
        "id": "WH-003",
        "name": "Arakkonam Disaster Relief Base",
        "location": "INS Rajali Sector",
        "coordinates": [13.0780, 79.6680],
        "capacity": 350000,
        "usedCapacity": 210000,
        "operationalStatus": "operational",
        "routeStatus": "delayed",
        "resources": [
            {"resourceType": "Water", "available": 110000, "reserved": 20000, "unit": "litres", "stockStatus": "healthy"},
            {"resourceType": "Food Packets", "available": 75000, "reserved": 10000, "unit": "packets", "stockStatus": "healthy"},
            {"resourceType": "Medicine", "available": 5200, "reserved": 800, "unit": "kits", "stockStatus": "healthy"},
            {"resourceType": "Shelter Kits", "available": 3200, "reserved": 300, "unit": "kits", "stockStatus": "healthy"},
        ],
    },
    {
        "id": "WH-004",
        "name": "Tiruvannamalai Staging Depot",
        "location": "South Outer Ring Bypass",
        "coordinates": [12.2250, 79.0740],
        "capacity": 150000,
        "usedCapacity": 89000,
        "operationalStatus": "degraded",
        "routeStatus": "clear",
        "resources": [
            {"resourceType": "Water", "available": 35000, "reserved": 5000, "unit": "litres", "stockStatus": "warning"},
            {"resourceType": "Food Packets", "available": 24000, "reserved": 3000, "unit": "packets", "stockStatus": "healthy"},
            {"resourceType": "Medicine", "available": 1200, "reserved": 200, "unit": "kits", "stockStatus": "warning"},
            {"resourceType": "Shelter Kits", "available": 400, "reserved": 100, "unit": "kits", "stockStatus": "critical"},
        ],
    },
]

_FALLBACK_REQUESTS = [
    {
        "id": "REQ-101",
        "areaId": "AREA-001",
        "areaName": "Katpadi North Sector",
        "disasterName": "Vellore Monsoon Flash Flood",
        "resourceType": "Water",
        "requestedQuantity": 15000,
        "unit": "litres",
        "urgency": "critical",
        "status": "pending",
        "requestedAt": "2026-10-06T06:15:00Z",
        "priorityScore": 91.4,
        "notes": "Floodwaters contaminated borewell supplies. Immediate potable water needed.",
    },
    {
        "id": "REQ-102",
        "areaId": "AREA-001",
        "areaName": "Katpadi North Sector",
        "disasterName": "Vellore Monsoon Flash Flood",
        "resourceType": "Medicine",
        "requestedQuantity": 800,
        "unit": "kits",
        "urgency": "critical",
        "status": "pending",
        "requestedAt": "2026-10-06T06:20:00Z",
        "priorityScore": 91.4,
        "notes": "Anti-venom and water-borne ailment treatment packets required.",
    },
    {
        "id": "REQ-103",
        "areaId": "AREA-002",
        "areaName": "Thorapadi Riverside",
        "disasterName": "Vellore Monsoon Flash Flood",
        "resourceType": "Food Packets",
        "requestedQuantity": 10000,
        "unit": "packets",
        "urgency": "high",
        "status": "pending",
        "requestedAt": "2026-10-06T06:30:00Z",
        "priorityScore": 84.8,
        "notes": "Community hall shelter housing 4,500 displaced residents.",
    },
    {
        "id": "REQ-104",
        "areaId": "AREA-003",
        "areaName": "Sathuvachari Zone 4",
        "disasterName": "Vellore Monsoon Flash Flood",
        "resourceType": "Shelter Kits",
        "requestedQuantity": 250,
        "unit": "kits",
        "urgency": "medium",
        "status": "approved",
        "requestedAt": "2026-10-06T05:45:00Z",
        "priorityScore": 74.2,
        "notes": "Temporary tent structures for displaced families.",
    },
]

_FALLBACK_ALLOCATIONS = [
    {
        "id": "ALC-501",
        "sourceWarehouse": "Vellore Central Depot",
        "sourceWarehouseId": "WH-001",
        "destinationArea": "Katpadi North Sector",
        "destinationAreaId": "AREA-001",
        "resourceType": "Water",
        "quantity": 12000,
        "unit": "litres",
        "priorityScore": 91.4,
        "aiRecommendation": True,
        "aiConfidence": 95,
        "approvalStatus": "pending_approval",
        "dispatchStatus": "pending",
        "estimatedDelivery": "1.5h",
        "createdAt": "2026-10-06T06:40:00Z",
        "explanation": "Allocated 12,000 litres potable water from Vellore Central Depot (3.2 km away) meeting 80% of critical request.",
    },
    {
        "id": "ALC-502",
        "sourceWarehouse": "Vellore Central Depot",
        "sourceWarehouseId": "WH-001",
        "destinationArea": "Katpadi North Sector",
        "destinationAreaId": "AREA-001",
        "resourceType": "Medicine",
        "quantity": 600,
        "unit": "kits",
        "priorityScore": 91.4,
        "aiRecommendation": True,
        "aiConfidence": 94,
        "approvalStatus": "approved",
        "dispatchStatus": "in_transit",
        "estimatedDelivery": "45m",
        "createdAt": "2026-10-06T06:45:00Z",
        "approvedBy": "AD (Mission Commander)",
        "approvedAt": "2026-10-06T06:50:00Z",
        "explanation": "Emergency medical allocation authorized for PHC Katpadi.",
    },
]

_FALLBACK_AUDIT_LOGS = [
    {
        "id": "AUD-001",
        "timestamp": "2026-10-06T06:50:00Z",
        "user": "Administrator",
        "userRole": "Mission Commander",
        "action": "ALLOCATION_APPROVED",
        "objectType": "Allocation",
        "objectId": "ALC-502",
        "result": "success",
        "details": "Authorized 600 Medicine kits from WH-001 to AREA-001",
    },
    {
        "id": "AUD-002",
        "timestamp": "2026-10-06T06:40:00Z",
        "user": "AI_ENGINE",
        "userRole": "System",
        "action": "RECOMMENDATION_GENERATED",
        "objectType": "Plan",
        "objectId": "PLAN-V1",
        "result": "info",
        "details": "Generated 2 new recommendations for Vellore Monsoon Flash Flood",
    },
]

_FALLBACK_TIMELINE = [
    {
        "id": "EVT-01",
        "disasterId": "DIS-001",
        "timestamp": "2026-10-06T04:30:00Z",
        "type": "INITIAL_ALLOCATION",
        "title": "Initial Plan Deployed",
        "description": "Baseline deployment of emergency water and medical rations across 4 sectors.",
    },
    {
        "id": "EVT-02",
        "disasterId": "DIS-001",
        "timestamp": "2026-10-06T05:15:00Z",
        "type": "FIELD_REPORT",
        "title": "Katpadi Breach Reported",
        "description": "Field Officer escalated Katpadi North severity to 9.5 following river levee breach.",
    },
    {
        "id": "EVT-03",
        "disasterId": "DIS-001",
        "timestamp": "2026-10-06T06:00:00Z",
        "type": "ROUTE_UPDATE",
        "title": "NH-75 Bridge Passage Blocked",
        "description": "Direct convoy routing rerouted via bypass road; transit times adjusted.",
    },
    {
        "id": "EVT-04",
        "disasterId": "DIS-001",
        "timestamp": "2026-10-06T06:40:00Z",
        "type": "AI_REALLOCATION",
        "title": "Automated Dynamic Plan Calculation",
        "description": "AI Reallocation engine synthesized fresh requests, yielding recommendations ALC-501 and ALC-502.",
    },
]

_FALLBACK_SIMULATIONS: List[Dict[str, Any]] = []

# ==========================================
# REPOSITORY CRUD FUNCTIONS
# ==========================================

def get_disasters() -> List[Dict[str, Any]]:
    if _DYNAMODB:
        try:
            table = _DYNAMODB.Table(DISASTERS_TABLE)
            response = table.scan()
            items = response.get("Items", [])
            if items:
                return [convert_from_dynamo(it) for it in items]
        except Exception:
            pass
    return list(_FALLBACK_DISASTERS)

def get_disaster(disaster_id: str) -> Optional[Dict[str, Any]]:
    disasters = get_disasters()
    return next((d for d in disasters if d["id"] == disaster_id), None)

def put_disaster(disaster: Dict[str, Any]) -> Dict[str, Any]:
    if not any(d["id"] == disaster["id"] for d in _FALLBACK_DISASTERS):
        _FALLBACK_DISASTERS.append(disaster)
    if _DYNAMODB:
        try:
            table = _DYNAMODB.Table(DISASTERS_TABLE)
            table.put_item(Item=convert_to_dynamo(disaster))
        except Exception as e:
            print(f"DynamoDB put_disaster error: {e}")
    return disaster

def get_areas(disaster_id: Optional[str] = None) -> List[Dict[str, Any]]:
    if _DYNAMODB:
        try:
            table = _DYNAMODB.Table(AREAS_TABLE)
            if disaster_id:
                response = table.query(
                    KeyConditionExpression="disasterId = :did",
                    ExpressionAttributeValues={":did": disaster_id}
                )
            else:
                response = table.scan()
            items = response.get("Items", [])
            if items:
                return [convert_from_dynamo(it) for it in items]
        except Exception:
            pass
    if disaster_id:
        return [a for a in _FALLBACK_AREAS if a.get("disasterId") == disaster_id]
    return list(_FALLBACK_AREAS)

def get_area(area_id: str) -> Optional[Dict[str, Any]]:
    areas = get_areas()
    return next((a for a in areas if a["id"] == area_id), None)

def put_area(area: Dict[str, Any]) -> Dict[str, Any]:
    if not any(a["id"] == area["id"] for a in _FALLBACK_AREAS):
        _FALLBACK_AREAS.append(area)
    if _DYNAMODB:
        try:
            table = _DYNAMODB.Table(AREAS_TABLE)
            table.put_item(Item=convert_to_dynamo(area))
        except Exception as e:
            print(f"DynamoDB put_area error: {e}")
    return area

def update_area(area_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    target = None
    for a in _FALLBACK_AREAS:
        if a["id"] == area_id:
            a.update(updates)
            target = a
            break
    if _DYNAMODB and target:
        try:
            table = _DYNAMODB.Table(AREAS_TABLE)
            table.put_item(Item=convert_to_dynamo(target))
        except Exception as e:
            print(f"DynamoDB update_area error: {e}")
    return target

def get_warehouses() -> List[Dict[str, Any]]:
    if _DYNAMODB:
        try:
            table = _DYNAMODB.Table(WAREHOUSES_TABLE)
            response = table.scan()
            items = response.get("Items", [])
            if items:
                return [convert_from_dynamo(it) for it in items]
        except Exception:
            pass
    return list(_FALLBACK_WAREHOUSES)

def put_warehouse(wh: Dict[str, Any]) -> Dict[str, Any]:
    if not any(w["id"] == wh["id"] for w in _FALLBACK_WAREHOUSES):
        _FALLBACK_WAREHOUSES.append(wh)
    if _DYNAMODB:
        try:
            table = _DYNAMODB.Table(WAREHOUSES_TABLE)
            table.put_item(Item=convert_to_dynamo(wh))
        except Exception as e:
            print(f"DynamoDB put_warehouse error: {e}")
    return wh

def get_warehouse(wh_id: str) -> Optional[Dict[str, Any]]:
    whs = get_warehouses()
    return next((w for w in whs if w["id"] == wh_id), None)

def update_warehouse(wh_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    target = None
    for w in _FALLBACK_WAREHOUSES:
        if w["id"] == wh_id:
            w.update(updates)
            target = w
            break
    if _DYNAMODB and target:
        try:
            table = _DYNAMODB.Table(WAREHOUSES_TABLE)
            table.put_item(Item=convert_to_dynamo(target))
        except Exception as e:
            print(f"DynamoDB update_warehouse error: {e}")
    return target

def get_requests() -> List[Dict[str, Any]]:
    if _DYNAMODB:
        try:
            table = _DYNAMODB.Table(REQUESTS_TABLE)
            response = table.scan()
            items = response.get("Items", [])
            if items:
                return [convert_from_dynamo(it) for it in items]
        except Exception:
            pass
    return list(_FALLBACK_REQUESTS)

def put_request(req: Dict[str, Any]) -> Dict[str, Any]:
    if not any(r["id"] == req["id"] for r in _FALLBACK_REQUESTS):
        _FALLBACK_REQUESTS.insert(0, req)
    if _DYNAMODB:
        try:
            table = _DYNAMODB.Table(REQUESTS_TABLE)
            table.put_item(Item=convert_to_dynamo(req))
        except Exception as e:
            print(f"DynamoDB put_request error: {e}")
    return req

def update_request(req_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    target = None
    for r in _FALLBACK_REQUESTS:
        if r["id"] == req_id:
            r.update(updates)
            target = r
            break
    if _DYNAMODB and target:
        try:
            table = _DYNAMODB.Table(REQUESTS_TABLE)
            table.put_item(Item=convert_to_dynamo(target))
        except Exception as e:
            print(f"DynamoDB update_request error: {e}")
    return target

def get_allocations() -> List[Dict[str, Any]]:
    if _DYNAMODB:
        try:
            table = _DYNAMODB.Table(ALLOCATIONS_TABLE)
            response = table.scan()
            items = response.get("Items", [])
            if items:
                return [convert_from_dynamo(it) for it in items]
        except Exception:
            pass
    return list(_FALLBACK_ALLOCATIONS)

def put_allocation(alc: Dict[str, Any]) -> Dict[str, Any]:
    if not any(a["id"] == alc["id"] for a in _FALLBACK_ALLOCATIONS):
        _FALLBACK_ALLOCATIONS.insert(0, alc)
    if _DYNAMODB:
        try:
            table = _DYNAMODB.Table(ALLOCATIONS_TABLE)
            table.put_item(Item=convert_to_dynamo(alc))
        except Exception as e:
            print(f"DynamoDB put_allocation error: {e}")
    return alc

def update_allocation(alc_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    target = None
    for a in _FALLBACK_ALLOCATIONS:
        if a["id"] == alc_id:
            a.update(updates)
            target = a
            break
    if _DYNAMODB and target:
        try:
            table = _DYNAMODB.Table(ALLOCATIONS_TABLE)
            table.put_item(Item=convert_to_dynamo(target))
        except Exception as e:
            print(f"DynamoDB update_allocation error: {e}")
    return target

def log_audit(user: str, user_role: str, action: str, object_type: str, object_id: str, result: str, details: str) -> Dict[str, Any]:
    entry = {
        "id": f"AUD-{int(datetime.utcnow().timestamp() * 1000)}",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "user": user,
        "userRole": user_role,
        "action": action,
        "objectType": object_type,
        "objectId": object_id,
        "result": result,
        "details": details,
    }
    _FALLBACK_AUDIT_LOGS.insert(0, entry)
    if _DYNAMODB:
        try:
            table = _DYNAMODB.Table(AUDIT_TABLE)
            table.put_item(Item=convert_to_dynamo(entry))
        except Exception as e:
            print(f"DynamoDB log_audit error: {e}")
    return entry

def get_audit_logs() -> List[Dict[str, Any]]:
    if _DYNAMODB:
        try:
            table = _DYNAMODB.Table(AUDIT_TABLE)
            response = table.scan()
            items = response.get("Items", [])
            if items:
                return sorted([convert_from_dynamo(it) for it in items], key=lambda x: x["timestamp"], reverse=True)
        except Exception:
            pass
    return list(_FALLBACK_AUDIT_LOGS)

def get_timeline(disaster_id: Optional[str] = None) -> List[Dict[str, Any]]:
    if _DYNAMODB:
        try:
            table = _DYNAMODB.Table(TIMELINE_TABLE)
            response = table.scan()
            items = response.get("Items", [])
            if items:
                return sorted([convert_from_dynamo(it) for it in items], key=lambda x: x["timestamp"])
        except Exception:
            pass
    return list(_FALLBACK_TIMELINE)

def add_timeline_event(event: Dict[str, Any]) -> Dict[str, Any]:
    if not any(e.get("id") == event.get("id") for e in _FALLBACK_TIMELINE):
        _FALLBACK_TIMELINE.append(event)
    if _DYNAMODB:
        try:
            table = _DYNAMODB.Table(TIMELINE_TABLE)
            table.put_item(Item=convert_to_dynamo(event))
        except Exception as e:
            print(f"DynamoDB add_timeline_event error: {e}")
    return event

def save_simulation(run_data: Dict[str, Any]) -> Dict[str, Any]:
    run_entry = {
        "id": f"SIM-{int(datetime.utcnow().timestamp())}",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        **run_data
    }
    _FALLBACK_SIMULATIONS.insert(0, run_entry)
    if _DYNAMODB:
        try:
            table = _DYNAMODB.Table(SIMULATIONS_TABLE)
            table.put_item(Item=convert_to_dynamo(run_entry))
        except Exception as e:
            print(f"DynamoDB save_simulation error: {e}")
    return run_entry
