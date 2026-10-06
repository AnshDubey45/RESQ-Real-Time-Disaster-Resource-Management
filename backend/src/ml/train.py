"""
ML Training Pipeline for RESQ-CLOUD.
Trains multi-target regression for humanitarian demand forecasting (water, food, medicine, shelter).
Saves model.joblib and model_meta.json.
"""

import os
import json
import csv
from datetime import datetime
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from .generate_data import generate_synthetic_dataset, DISASTER_TYPES

MODEL_VERSION = "rf-1.0.0"

def train_demand_model(
    data_path: str = None,
    output_model_path: str = "backend/src/ml/model.joblib",
    output_meta_path: str = "backend/src/ml/model_meta.json",
):
    if not data_path or not os.path.exists(data_path):
        data_path = "backend/src/ml/synthetic_disaster_demand.csv"
        generate_synthetic_dataset(1500, data_path)

    # Read data
    X = []
    y = []
    type_to_idx = {t: i for i, t in enumerate(DISASTER_TYPES)}

    with open(data_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            dtype_val = type_to_idx.get(row["disaster_type"], 0)
            X.append([
                dtype_val,
                float(row["severity"]),
                float(row["affected_population"]),
                float(row["duration_days"]),
                float(row["medical_urgency"]),
                float(row["accessibility"]),
            ])
            y.append([
                float(row["water_demand"]),
                float(row["food_demand"]),
                float(row["medicine_demand"]),
                float(row["shelter_demand"]),
            ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Fast and light random forest suitable for Lambda packages
    model = RandomForestRegressor(n_estimators=35, max_depth=12, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)

    # Ensure output directories exist
    os.makedirs(os.path.dirname(os.path.abspath(output_model_path)), exist_ok=True)
    os.makedirs(os.path.dirname(os.path.abspath(output_meta_path)), exist_ok=True)

    # Save model and meta
    joblib.dump(model, output_model_path)

    metadata = {
        "model_version": MODEL_VERSION,
        "algorithm": "RandomForestRegressor",
        "trained_at": datetime.utcnow().isoformat() + "Z",
        "synthetic": True,
        "metrics": {
            "mae": round(float(mae), 2),
            "r2_score": round(float(r2), 4),
        },
        "features": [
            "disaster_type_idx",
            "severity",
            "affected_population",
            "duration_days",
            "medical_urgency",
            "accessibility",
        ],
        "targets": ["water_demand", "food_demand", "medicine_demand", "shelter_demand"],
        "disaster_types": DISASTER_TYPES,
    }

    with open(output_meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"Model trained successfully: Version {MODEL_VERSION}, R2: {r2:.4f}, MAE: {mae:.2f}")
    return metadata

if __name__ == "__main__":
    train_demand_model()
