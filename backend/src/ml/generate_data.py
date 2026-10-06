"""
Synthetic Data Generator for RESQ-CLOUD Demand Prediction Model.
Generates realistic training data labeled explicitly as synthetic.
"""

import random
import csv
import os

DISASTER_TYPES = ["flood", "earthquake", "cyclone", "drought", "landslide"]

def generate_synthetic_dataset(num_samples: int = 1200, output_file: str = "synthetic_disaster_demand.csv") -> str:
    """
    Generates synthetic training records based on established humanitarian aid logistics ratios.
    """
    rows = []
    headers = [
        "disaster_type",
        "severity",            # 1 - 10
        "affected_population", # 1,000 - 200,000
        "duration_days",       # 1 - 30
        "medical_urgency",     # 0 - 100
        "accessibility",       # 0 - 100
        "water_demand",        # liters
        "food_demand",         # meal packets
        "medicine_demand",     # kits
        "shelter_demand",      # tents/kits
    ]

    for _ in range(num_samples):
        dtype = random.choice(DISASTER_TYPES)
        sev = round(random.uniform(2.0, 9.8), 1)
        pop = random.randint(1500, 150000)
        dur = random.randint(1, 21)
        med = round(random.uniform(15.0, 95.0), 1)
        acc = round(random.uniform(10.0, 95.0), 1)

        # Baseline per person per day with disaster type multiplier and random noise
        type_mult = {
            "flood": {"water": 1.4, "food": 1.2, "med": 1.3, "shelter": 1.5},
            "earthquake": {"water": 1.1, "food": 1.1, "med": 1.9, "shelter": 2.2},
            "cyclone": {"water": 1.3, "food": 1.3, "med": 1.4, "shelter": 2.0},
            "drought": {"water": 2.2, "food": 1.5, "med": 1.1, "shelter": 0.5},
            "landslide": {"water": 1.1, "food": 1.0, "med": 1.6, "shelter": 1.4},
        }[dtype]

        # Inaccessibility amplifies demand buffers due to delivery uncertainty
        iso_factor = 1.0 + (100.0 - acc) / 250.0

        # Calculations + noise
        noise = random.uniform(0.92, 1.08)
        water = int(pop * 3.5 * dur * (sev / 10.0) * type_mult["water"] * iso_factor * noise)
        food = int(pop * 2.0 * dur * (sev / 10.0) * type_mult["food"] * iso_factor * noise)
        med_kits = int(pop * 0.05 * (med / 50.0) * (sev / 10.0) * type_mult["med"] * noise)
        shelter = int((pop / 5.0) * 0.25 * (sev / 10.0) * type_mult["shelter"] * noise)

        rows.append([
            dtype, sev, pop, dur, med, acc,
            max(10, water), max(10, food), max(1, med_kits), max(1, shelter)
        ])

    dir_path = os.path.dirname(os.path.abspath(output_file))
    if dir_path and not os.path.exists(dir_path):
        os.makedirs(dir_path, exist_ok=True)

    with open(output_file, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)

    return output_file

if __name__ == "__main__":
    out = generate_synthetic_dataset(1500, "synthetic_disaster_demand.csv")
    print(f"Generated {out}")
