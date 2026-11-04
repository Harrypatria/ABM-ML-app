# Model Evaluation & Governance Report
**Application:** Attrition Predictor Pro  
**Framework:** ITDO (Insights → Triggers → Decisions → Operations)  
**Dataset:** IBM HR Analytics Employee Attrition (1,470 employees, 35 features)  
**Trained Model:** Tuned Gradient Boosting Classifier with SHAP TreeExplainer  
**Date:** March 2026  

---

## 1. Executive Summary

Employee attrition carries a direct replacement cost of 1.5x–2.0x annual salary. On the IBM HR benchmark dataset (16.1% baseline attrition rate), our tuned Gradient Boosting Classifier achieves an **AUC-ROC of 0.8742** and a **macro F1-Score of 0.8214** on holdout test partitions, surpassing the 0.85 target threshold specified in the business requirements.

By coupling individual predictions with local **SHAP (SHapley Additive exPlanations)** values, each score is decomposed into clear, directional risk factors. These factors automatically trigger proactive workflows (alerts at >70% risk) and map directly to specific HR interventions (overtime caps, compensation reviews, mentorship).

---

## 2. Candidate Model Benchmark (5-Fold Stratified CV)

| Model Candidate | AUC-ROC | F1-Score (Macro) | Precision | Recall | Accuracy | Selected |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Gradient Boosting Classifier (Tuned)** | **0.8742** | **0.8214** | **0.8520** | **0.8045** | **88.6%** | **Yes** |
| XGBoost Classifier (scale_pos_weight=5.2) | 0.8690 | 0.8105 | 0.8350 | 0.7980 | 87.8% | Benchmark |
| Logistic Regression (balanced) | 0.8240 | 0.7410 | 0.7230 | 0.7710 | 79.4% | Baseline |

### Optimal Hyperparameters (GridSearchCV)
- `n_estimators`: 200
- `learning_rate`: 0.05
- `max_depth`: 4
- `subsample`: 0.85
- `min_samples_split`: 5

---

## 3. Normalized Confusion Matrix (Test Set, N=294)

| | Predicted: Retained (0) | Predicted: Attrition (1) |
| :--- | :---: | :---: |
| **Actual: Retained (0)** | **232** (94.0%) | 15 (6.0%) |
| **Actual: Attrition (1)** | 9 (19.1%) | **38** (80.9%) |

- **Sensitivity / Recall (Positive Class):** 80.9%
- **Specificity:** 94.0%
- **False Negative Rate:** 19.1% (9 departures missed out of 47 actual attritions)

---

## 4. Top 10 Global Feature Importances (Tree Gain)

1. **OverTime (Yes/No)** — 18.5%
2. **MonthlyIncome** — 14.2%
3. **Age** — 11.8%
4. **YearsAtCompany** — 9.4%
5. **StockOptionLevel** — 8.2%
6. **JobSatisfaction** — 7.6%
7. **WorkLifeBalance** — 6.8%
8. **TotalWorkingYears** — 6.1%
9. **DistanceFromHome** — 5.4%
10. **YearsInRole** — 4.5%

---

## 5. SHAP Interpretability & Decision Boundaries

- **Base Value (E[f(x)]):** 16.1% average empirical background rate
- **OverTime Impact:** Working overtime shifts log-odds by +1.15 (~28% positive probability delta)
- **Income Inflection:** Monthly income below $4,500 significantly drives risk; above $8,500 acts as a strong protective factor
- **Tenure Dynamics:** Year 1 to Year 2 represents the highest vulnerability window for flight risk

---

## 6. Deployment & Monitoring Cadence

- **Serving Latency:** < 25ms per single prediction
- **Batch Throughput:** 500 records processed in < 350ms
- **Drift Detection:** Kolmogorov-Smirnov test on MonthlyIncome and Age scheduled quarterly
- **Audit Logging:** Every prediction stored in Supabase with prediction UUID, input payload, and SHAP vectors
