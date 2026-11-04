"""
Intervention mapping engine for ITDO Framework.
Maps SHAP risk factors and feature levels to HR actions.
"""
from typing import List, Dict, Any


INTERVENTION_CATALOG = {
    "OverTime": {
        "trigger": lambda val: str(val).lower() == "yes",
        "action": "Implement flexible work arrangements & enforce 15% overtime cap policy.",
        "category": "Workload & Wellbeing",
        "urgency": "High",
    },
    "MonthlyIncome": {
        "trigger": lambda val: float(val) < 4500,
        "action": "Conduct compensation benchmarking against industry P50/P75 and schedule equity refresh review.",
        "category": "Compensation & Benefits",
        "urgency": "High",
    },
    "JobSatisfaction": {
        "trigger": lambda val: int(val) <= 2,
        "action": "Schedule dedicated 1:1 career development session & clarify role autonomy expectations.",
        "category": "Role & Engagement",
        "urgency": "Medium",
    },
    "WorkLifeBalance": {
        "trigger": lambda val: int(val) <= 2,
        "action": "Enrol in Employee Assistance Programme (EAP) & audit meeting load / quiet Fridays.",
        "category": "Workload & Wellbeing",
        "urgency": "High",
    },
    "YearsAtCompany": {
        "trigger": lambda val: float(val) <= 2,
        "action": "Assign senior buddy mentorship and schedule 30-60-90 day milestone check-ins.",
        "category": "Onboarding & Retention",
        "urgency": "Medium",
    },
    "StockOptionLevel": {
        "trigger": lambda val: int(val) == 0,
        "action": "Review long-term incentive plan (LTIP) & grant entry-level equity participation.",
        "category": "Compensation & Benefits",
        "urgency": "Medium",
    },
    "BusinessTravel": {
        "trigger": lambda val: str(val) == "Travel_Frequently",
        "action": "Conduct travel load audit; provide 2 designated remote flex days per travel cycle.",
        "category": "Workload & Wellbeing",
        "urgency": "Medium",
    },
    "YearsSinceLastPromotion": {
        "trigger": lambda val: float(val) >= 4,
        "action": "Initiate lateral internal mobility review or fast-track skill promotion pathway.",
        "category": "Career Growth",
        "urgency": "High",
    },
    "EnvironmentSatisfaction": {
        "trigger": lambda val: int(val) <= 2,
        "action": "Conduct psychological safety and departmental working environment audit with People Partner.",
        "category": "Culture & Leadership",
        "urgency": "Medium",
    },
    "DistanceFromHome": {
        "trigger": lambda val: float(val) >= 15,
        "action": "Grant flexible remote work allowance (3+ days/week) or commuter transit subsidy.",
        "category": "Workload & Wellbeing",
        "urgency": "Low",
    },
}


def derive_interventions(
    features: Dict[str, Any], top_risk_factors: List[Dict[str, Any]]
) -> List[str]:
    """
    Derives actionable HR interventions based on employee attributes and SHAP drivers.
    Returns prioritized list of recommendations.
    """
    interventions = []
    seen_categories = set()

    # First priority: factors that directly increase attrition according to SHAP
    for factor in top_risk_factors:
        feat_name = factor.get("feature")
        direction = factor.get("direction", "increases")
        if direction == "increases" and feat_name in INTERVENTION_CATALOG:
            rule = INTERVENTION_CATALOG[feat_name]
            val = features.get(feat_name.lower()) or features.get(feat_name)
            if val is not None and rule["trigger"](val):
                interventions.append(rule["action"])
                seen_categories.add(rule["category"])

    # Fallback/Additional check across key stress vectors if list is short
    if len(interventions) < 3:
        for feat_name, rule in INTERVENTION_CATALOG.items():
            if rule["category"] in seen_categories:
                continue
            val = features.get(feat_name.lower()) or features.get(feat_name)
            if val is not None:
                try:
                    if rule["trigger"](val):
                        interventions.append(rule["action"])
                        seen_categories.add(rule["category"])
                except Exception:
                    continue
            if len(interventions) >= 4:
                break

    if not interventions:
        interventions.append("Schedule proactive quarterly retention pulse check-in with department manager.")
        interventions.append("Review annual total rewards statement and professional development budget allocation.")

    return interventions[:5]
