"""
Unit Tests for RESQ-CLOUD Core Engines.
Validates Priority, Allocation, Explanation, Simulation, and Reallocation logic.
"""

import pytest
from src.engines.priority import calculate_priority_score, rank_affected_areas
from src.engines.allocation import allocate_resources, haversine_distance
from src.engines.explain import generate_explanation
from src.engines.simulation import run_simulation
from src.engines.reallocation import trigger_reallocation

def test_priority_score_worked_example():
    """
    PRD Section 7.1 worked example:
    Severity 95, Population 80, Medical 90, Shortage 85, Accessibility 70
    0.30*95 + 0.25*80 + 0.20*90 + 0.15*85 + 0.10*70
    = 28.5 + 20 + 18 + 12.75 + 7 = 86.25
    """
    result = calculate_priority_score(
        severity=95,
        population_impact=80,
        medical_urgency=90,
        resource_shortage=85,
        accessibility=70,
    )
    assert result["priority_score"] == 86.25
    assert result["priority_level"] == "critical"
    assert result["contributions"]["severity"] == 28.5
    assert result["contributions"]["population_impact"] == 20.0
    assert result["contributions"]["medical_urgency"] == 18.0
    assert result["contributions"]["resource_shortage"] == 12.75
    assert result["contributions"]["accessibility"] == 7.0

def test_haversine_distance():
    # Distance between Katpadi (12.9689, 79.1368) and Ranipet (12.9350, 79.3280) is ~21 km
    dist = haversine_distance((12.9689, 79.1368), (12.9350, 79.3280))
    assert 18.0 < dist < 25.0

def test_allocation_never_exceeds_stock_and_respects_reserve():
    warehouses = [
        {
            "id": "WH-1",
            "name": "Depot 1",
            "operationalStatus": "operational",
            "routeStatus": "clear",
            "coordinates": [12.9, 79.1],
            "resources": [
                {"resourceType": "Water", "available": 1000, "reserved": 0, "unit": "litres"}
            ]
        }
    ]
    # Requesting 2000 units when only 1000 exist with a 10% reserve (max allocatable = 900)
    requests = [
        {
            "id": "REQ-1",
            "areaId": "AREA-1",
            "resourceType": "Water",
            "requestedQuantity": 2000,
            "unit": "litres",
            "priorityScore": 90,
            "coordinates": [12.91, 79.11]
        }
    ]

    res = allocate_resources(requests, warehouses, reserve_percent=0.10)
    assert len(res["recommendations"]) == 1
    allocated_qty = res["recommendations"][0]["quantity"]
    assert allocated_qty == 900 # 1000 - 100 reserve
    assert res["shortages"]["Water"] == 1100

def test_explanation_factor_points_sum_to_priority_score():
    area = {
        "id": "AREA-A",
        "name": "Katpadi",
        "priorityScore": 86.25,
        "severityScore": 9.5,
        "population": 38000,
        "medicalUrgency": 90,
        "accessibility": 70,
        "priorityFactors": {"populationImpact": 80, "resourceShortage": 85}
    }
    rec = {
        "quantity": 500,
        "resourceType": "Water",
        "unit": "litres",
        "priorityScore": 86.25,
        "sourceWarehouse": "Depot 1"
    }

    exp = generate_explanation(rec, area, distance_km=5.0)
    total_points = sum(c["points"] for c in exp["factor_contributions"])
    assert round(total_points, 2) == 86.25
    assert len(exp["facts"]) >= 2
    assert "recommendation" in exp

def test_simulation_never_mutates_live_data():
    sim_input = {
        "disasterType": "flood",
        "population": 60000,
        "severity": 9,
        "duration": 5,
        "medicalUrgency": 85,
        "accessibility": 40,
        "inventoryModifier": 100,
    }
    res = run_simulation(sim_input)
    assert res["waterDemand"]["simulated"] > res["waterDemand"]["current"]
    assert res["foodDemand"]["simulated"] > res["foodDemand"]["current"]
    assert "shortages" in res
    assert len(res["priorityRanking"]) > 0
    assert res["scenarioMeta"]["liveDataModified"] is False

def test_reallocation_marks_superseded_and_preserves_locked():
    areas = [
        {"id": "A1", "name": "Zone 1", "severity": 9, "population": 20000, "medicalUrgency": 90, "accessibility": 30},
        {"id": "A2", "name": "Zone 2", "severity": 7, "population": 30000, "medicalUrgency": 60, "accessibility": 80},
    ]
    warehouses = [
        {"id": "W1", "name": "Hub 1", "operationalStatus": "operational", "routeStatus": "clear", "resources": [{"resourceType": "Water", "available": 5000, "reserved": 0}]}
    ]
    requests = [
        {"id": "R1", "areaId": "A1", "resourceType": "Water", "requestedQuantity": 1000, "priorityScore": 85}
    ]
    existing_allocations = [
        {"id": "ALC-OLD-1", "approvalStatus": "pending_approval", "dispatchStatus": "pending"},
        {"id": "ALC-DISPATCHED-1", "approvalStatus": "dispatched", "dispatchStatus": "in_transit"},
    ]

    res = trigger_reallocation(
        trigger_type="area_condition_change",
        details="Levee breach in Zone 1",
        areas=areas,
        warehouses=warehouses,
        existing_requests=requests,
        existing_allocations=existing_allocations,
    )

    assert "ALC-OLD-1" in res["superseded_allocation_ids"]
    assert "ALC-DISPATCHED-1" not in res["superseded_allocation_ids"]
    assert res["diff"]["locked_dispatched_count"] == 1
    assert res["timeline_event"]["type"] == "area_condition_change"
