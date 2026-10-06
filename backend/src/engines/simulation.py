"""
Simulation Engine for RESQ-CLOUD.
Runs what-if disaster escalation scenarios on isolated in-memory data copies.
Strictly read-only; never mutates live database state.
"""

import copy
from typing import Dict, Any, List
from .priority import calculate_priority_score

def run_simulation(
    simulation_input: Dict[str, Any],
    baseline_areas: List[Dict[str, Any]] = None,
    baseline_warehouses: List[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Simulates resource strain under modified disaster conditions.
    """
    sim_data = copy.deepcopy(simulation_input)
    
    pop = float(sim_data.get("population", 50000))
    sev = float(sim_data.get("severity", 8)) # 1-10 scale
    duration_days = float(sim_data.get("duration", 7))
    med_urgency = float(sim_data.get("medicalUrgency", 75))
    accessibility = float(sim_data.get("accessibility", 60))
    inv_mod = float(sim_data.get("inventoryModifier", 100)) / 100.0 # 0.5 to 1.5

    # Core demand formulas based on standard emergency response logistics:
    # Water: ~3-4L per person per day
    # Food: ~2 packets per person per day
    # Medicine: ~0.1 kits per person impacted
    # Shelter: ~0.05 kits per person impacted
    base_factor = (pop * (sev / 10.0))
    
    current_water = round(base_factor * 3.0 * duration_days)
    simulated_water = round(current_water * 1.35 * (1.0 + (100.0 - accessibility) / 200.0))

    current_food = round(base_factor * 2.0 * duration_days)
    simulated_food = round(current_food * 1.25)

    current_medicine = round(base_factor * 0.1 * (med_urgency / 50.0))
    simulated_medicine = round(current_medicine * 1.45)

    current_shelter = round(base_factor * 0.05 * (sev / 5.0))
    simulated_shelter = round(current_shelter * 1.3)

    # Estimate available inventory based on modifier
    avail_water = 350000 * inv_mod
    avail_food = 220000 * inv_mod
    avail_medicine = 12000 * inv_mod
    avail_shelter = 6000 * inv_mod

    shortages = {}
    if simulated_water > avail_water:
        shortages["Water"] = int(simulated_water - avail_water)
    if simulated_food > avail_food:
        shortages["Food Packets"] = int(simulated_food - avail_food)
    if simulated_medicine > avail_medicine:
        shortages["Medicine Kits"] = int(simulated_medicine - avail_medicine)
    if simulated_shelter > avail_shelter:
        shortages["Shelter Kits"] = int(simulated_shelter - avail_shelter)

    additional_required = {
        k: int(v * 1.15) for k, v in shortages.items()
    }

    # Simulated priority ranking for key simulated sectors
    ranking_data = [
        {"area": "Sector 1 (Lowland Inundated)", "sev": sev * 10, "pop_imp": 95, "med": med_urgency, "acc": accessibility},
        {"area": "Sector 2 (Central Medical Hub)", "sev": sev * 9.5, "pop_imp": 85, "med": min(100, med_urgency * 1.2), "acc": accessibility * 0.9},
        {"area": "Sector 3 (Isolated Perimeter)", "sev": sev * 8.5, "pop_imp": 70, "med": med_urgency * 0.8, "acc": min(100, accessibility * 1.3)},
        {"area": "Sector 4 (Relief Camp East)", "sev": sev * 7.0, "pop_imp": 60, "med": med_urgency * 0.6, "acc": accessibility * 0.7},
    ]

    priority_ranking = []
    for s in ranking_data:
        score_res = calculate_priority_score(
            severity=s["sev"],
            population_impact=s["pop_imp"],
            medical_urgency=s["med"],
            resource_shortage=80.0,
            accessibility=s["acc"],
        )
        priority_ranking.append({
            "area": s["area"],
            "score": score_res["priority_score"],
        })

    priority_ranking.sort(key=lambda x: x["score"], reverse=True)

    return {
        "waterDemand": {"current": current_water, "simulated": simulated_water},
        "foodDemand": {"current": current_food, "simulated": simulated_food},
        "medicineDemand": {"current": current_medicine, "simulated": simulated_medicine},
        "shelterDemand": {"current": current_shelter, "simulated": simulated_shelter},
        "shortages": shortages,
        "additionalRequired": additional_required,
        "priorityRanking": priority_ranking,
        "scenarioMeta": {
            "mode": "simulation",
            "liveDataModified": False,
            "disasterType": sim_data.get("disasterType", "flood"),
            "inventoryModifier": inv_mod,
        }
    }
