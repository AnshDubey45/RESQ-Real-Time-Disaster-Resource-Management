"""
Integration Tests for AWS Lambda HTTP Handlers.
Simulates API Gateway HTTP events and verifies status codes and response structures.
"""

import json
from src.handlers.health import handler as health_handler
from src.handlers.disasters import handler as disasters_handler
from src.handlers.priorities import handler as priorities_handler
from src.handlers.simulations import handler as simulations_handler
from src.handlers.router import handler as router_handler

def test_health_handler():
    event = {"rawPath": "/health", "requestContext": {"http": {"method": "GET"}}}
    res = health_handler(event, None)
    assert res["statusCode"] == 200
    body = json.loads(res["body"])
    assert body["status"] == "ok"
    assert body["api"] == "operational"
    assert body["database"] == "operational"

def test_disasters_handler_and_dashboard_stats():
    event = {"rawPath": "/disasters", "requestContext": {"http": {"method": "GET"}}}
    res = disasters_handler(event, None)
    assert res["statusCode"] == 200
    body = json.loads(res["body"])
    assert isinstance(body, list)
    assert len(body) >= 1

    event_stats = {"rawPath": "/dashboard/stats", "requestContext": {"http": {"method": "GET"}}}
    res_stats = disasters_handler(event_stats, None)
    assert res_stats["statusCode"] == 200
    stats = json.loads(res_stats["body"])
    assert "activeDisasters" in stats
    assert "criticalAreas" in stats

def test_priorities_handler():
    event = {"rawPath": "/disasters/DIS-001/priorities", "pathParameters": {"id": "DIS-001"}}
    res = priorities_handler(event, None)
    assert res["statusCode"] == 200
    body = json.loads(res["body"])
    assert "priorities" in body
    assert len(body["priorities"]) >= 1

def test_simulations_handler():
    payload = {
        "disasterType": "flood",
        "population": 40000,
        "severity": 8,
        "duration": 5,
        "medicalUrgency": 70,
        "accessibility": 60,
        "inventoryModifier": 100,
    }
    event = {
        "requestContext": {"http": {"method": "POST"}},
        "body": json.dumps(payload),
    }
    res = simulations_handler(event, None)
    assert res["statusCode"] == 201
    body = json.loads(res["body"])
    assert "waterDemand" in body
    assert "priorityRanking" in body

def test_master_router():
    event = {"rawPath": "/health", "requestContext": {"http": {"method": "GET"}}}
    res = router_handler(event, None)
    assert res["statusCode"] == 200
    body = json.loads(res["body"])
    assert body["status"] == "ok"
