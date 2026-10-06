"""
ML Demand Prediction Lambda Handler for RESQ-CLOUD.
Returns time-series demand predictions, confidence intervals, and model version metadata.
"""

from .common import success_response, get_query_param
from .. import db
from ..ml.predict import predict_demand, get_model_and_meta

def handler(event, context):
    raw_path = event.get("rawPath") or event.get("path", "")
    
    # 1. GET /model/info
    if "/model/info" in raw_path:
        _, meta = get_model_and_meta()
        return success_response(meta)

    # 2. GET /predictions or /disasters/{id}/predictions
    area_id = get_query_param(event, "areaId")
    resource_type = get_query_param(event, "resourceType", "Water")

    areas = db.get_areas()
    if area_id:
        target_areas = [a for a in areas if a["id"] == area_id]
    else:
        target_areas = areas[:4] # Top 4 areas

    predictions = []
    for a in target_areas:
        pred = predict_demand(
            area_id=a["id"],
            area_name=a.get("name", a["id"]),
            disaster_type="flood",
            population=int(a.get("population", 40000)),
            severity=float(a.get("severityScore", 8.0)),
            medical_urgency=float(a.get("medicalUrgency", 75.0)),
            accessibility=float(a.get("accessibility", 50.0)),
            resource_type=resource_type,
        )
        predictions.append(pred)

    return success_response(predictions)
