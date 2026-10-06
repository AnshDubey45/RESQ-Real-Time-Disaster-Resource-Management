"""
Unit Tests for RESQ-CLOUD ML Demand Prediction.
"""

from src.ml.predict import predict_demand, get_model_and_meta

def test_ml_prediction_bounds_and_structure():
    pred = predict_demand(
        area_id="AREA-TEST",
        area_name="Test Area",
        disaster_type="flood",
        population=50000,
        severity=8.5,
        medical_urgency=80.0,
        accessibility=50.0,
        resource_type="Water",
        horizon_days=7,
    )

    assert pred["resourceType"] == "Water"
    assert pred["predictedDemand"] > 0
    assert pred["currentDemand"] > 0
    assert len(pred["timeSeries"]) == 7
    assert pred["isSynthetic"] is True
    assert "modelVersion" in pred

    # Verify time series bounds
    for pt in pred["timeSeries"]:
        assert pt["predicted"] > 0
        assert pt["lowerBound"] <= pt["predicted"]
        assert pt["upperBound"] >= pt["predicted"]

def test_model_metadata():
    _, meta = get_model_and_meta()
    assert meta["synthetic"] is True
    assert "model_version" in meta
    assert meta["metrics"]["r2_score"] > 0.70
