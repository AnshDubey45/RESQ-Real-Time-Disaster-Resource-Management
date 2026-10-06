"""
Priority Engine for RESQ-CLOUD.
Calculates transparent, multi-factor priority scores for affected areas during disaster response.
Formula:
  Priority Score = 0.30 * Severity
                 + 0.25 * Population Impact
                 + 0.20 * Medical Urgency
                 + 0.15 * Resource Shortage
                 + 0.10 * Accessibility Need
"""

from typing import Dict, Any, List

WEIGHTS = {
    "severity": 0.30,
    "population_impact": 0.25,
    "medical_urgency": 0.20,
    "resource_shortage": 0.15,
    "accessibility": 0.10,
}

def get_priority_level(score: float) -> str:
    """Return semantic priority level according to RESQ design specifications."""
    if score >= 80.0:
        return "critical"
    elif score >= 60.0:
        return "high"
    elif score >= 40.0:
        return "medium"
    return "low"

def calculate_priority_score(
    severity: float,
    population_impact: float,
    medical_urgency: float,
    resource_shortage: float,
    accessibility: float,
    weights: Dict[str, float] = None,
) -> Dict[str, Any]:
    """
    Calculate priority score and individual factor contributions (0-100 scale).
    Returns total score rounded to 2 decimal places and the detailed breakdown.
    """
    w = weights or WEIGHTS
    
    # Clamp inputs between 0 and 100
    sev = max(0.0, min(100.0, float(severity)))
    pop = max(0.0, min(100.0, float(population_impact)))
    med = max(0.0, min(100.0, float(medical_urgency)))
    shortage = max(0.0, min(100.0, float(resource_shortage)))
    acc = max(0.0, min(100.0, float(accessibility)))

    c_sev = round(sev * w["severity"], 2)
    c_pop = round(pop * w["population_impact"], 2)
    c_med = round(med * w["medical_urgency"], 2)
    c_shortage = round(shortage * w["resource_shortage"], 2)
    c_acc = round(acc * w["accessibility"], 2)

    total_score = round(c_sev + c_pop + c_med + c_shortage + c_acc, 2)
    total_score = max(0.0, min(100.0, total_score))

    return {
        "priority_score": total_score,
        "priority_level": get_priority_level(total_score),
        "factors": {
            "severity": sev,
            "population_impact": pop,
            "medical_urgency": med,
            "resource_shortage": shortage,
            "accessibility": acc,
        },
        "contributions": {
            "severity": c_sev,
            "population_impact": c_pop,
            "medical_urgency": c_med,
            "resource_shortage": c_shortage,
            "accessibility": c_acc,
        },
        "weights": w,
    }

def rank_affected_areas(areas: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Given a list of areas in a disaster, computes their relative population impact,
    computes priority scores, and returns areas sorted by priority descending.
    """
    if not areas:
        return []

    # Calculate max population for normalizing population impact if not given
    max_pop = max((float(a.get("population", 0)) for a in areas), default=1.0)
    if max_pop == 0:
        max_pop = 1.0

    ranked = []
    for area in areas:
        pop = float(area.get("population", 0))
        # If population_impact is not explicitly provided, normalize against max
        pop_impact = area.get("population_impact")
        if pop_impact is None:
            pop_impact = (pop / max_pop) * 100.0

        # Severity can be 1-10 or 0-100
        raw_sev = float(area.get("severityScore", area.get("severity", 5)))
        if raw_sev <= 10.0:
            sev = raw_sev * 10.0
        else:
            sev = raw_sev

        med = float(area.get("medicalUrgency", area.get("medical_urgency", 50)))
        
        # Shortage calculation: can be provided or derived from shortage map
        shortage = float(area.get("shortageScore", area.get("resource_shortage", 50)))
        
        # Accessibility factor: higher means harder to reach / higher urgency need
        acc = float(area.get("accessibility", 50))

        result = calculate_priority_score(
            severity=sev,
            population_impact=pop_impact,
            medical_urgency=med,
            resource_shortage=shortage,
            accessibility=acc,
        )

        area_copy = dict(area)
        area_copy["priorityScore"] = result["priority_score"]
        area_copy["priorityLevel"] = result["priority_level"]
        area_copy["priorityFactors"] = {
            "severity": sev,
            "populationImpact": pop_impact,
            "medicalUrgency": med,
            "resourceShortage": shortage,
            "accessibility": acc,
        }
        area_copy["factorContributions"] = result["contributions"]
        ranked.append(area_copy)

    # Sort descending by priorityScore, then medicalUrgency
    ranked.sort(key=lambda x: (x["priorityScore"], x.get("medicalUrgency", 0)), reverse=True)
    return ranked
