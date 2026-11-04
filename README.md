# Attrition Predictor Pro

A production-grade, full-stack machine learning web application for employee attrition prediction and proactive retention management. Built on the **ITDO Framework** (Insights → Triggers → Decisions → Operations) with local SHAP (SHapley Additive exPlanations) interpretability.

---

## 1. Stack Architecture

- **Machine Learning & Modeling:** Scikit-Learn `GradientBoostingClassifier` (Tuned), `SHAP` TreeExplainer, 5-Fold Stratified Cross-Validation, Class Imbalance weighting (~16.1% baseline).
- **Backend Services:** Python 3.11, FastAPI, Pydantic v2 validation, Uvicorn, SlowAPI rate limiting, Structlog.
- **Frontend & Visualizations:** React 18, Vite, TypeScript, Tailwind CSS v4, Recharts, Lucide Icons.
- **Persistence & Security:** Supabase (PostgreSQL 15), Row Level Security (RLS) policies, UUID identifiers.
- **Design System:** Dark professional theme (`slate-950` / `slate-900` canvas, `cyan-400` accent, `DM Serif Display` + `DM Sans` + `JetBrains Mono` tabular figures).

---

## 2. ITDO Framework Implementation

1. **Insights (`/predict` & `/batch`):**
   - 35-feature IBM HR Analytics Employee Attrition model.
   - Slicer UI with 300ms live debounced probability gauge.
   - Horizontal SHAP Waterfall Chart showing baseline prior $E[f(X)]=16.1\%$, positive risk drivers (rose), and protective factors (cyan).
2. **Triggers (`/alerts`):**
   - Automated threshold detection (configurable default $>70\%$).
   - Status transitions (`OPEN` → `ACKNOWLEDGED` → `RESOLVED`).
   - Bulk reassignment to dedicated HR Business Partners.
3. **Decisions (`/model`):**
   - Holdout metrics: **AUC-ROC 0.8742**, **Macro F1 0.8214**, **Precision 85.2%**, **Recall 80.5%**, **Accuracy 88.6%**.
   - Interactive Receiver Operating Characteristic (ROC) curve.
   - Normalized confusion matrix and Top 15 feature importances.
4. **Operations (`/tasks`):**
   - Kanban board with 4 columns: `TODO` | `IN_PROGRESS` | `DONE` | `CANCELLED`.
   - Rule-based action mapping directly pre-filled from SHAP drivers (e.g. Overtime caps, equity refreshes, commute subsidies).

---

## 3. Repository Structure

```
├── .github/
│   └── workflows/ci.yml         # GitHub Actions CI workflow
├── backend/
│   ├── data_pipeline.py         # Phase 1: Data ingestion & constant dropping
│   ├── preprocessing.py         # Phase 3: ColumnTransformer, Scaler & OHE
│   ├── train.py                 # Phase 4 & 6: 5-Fold CV & model serialization
│   ├── main.py                  # Phase 5: FastAPI REST API service
│   ├── schemas.py               # Pydantic v2 request/response contracts
│   └── interventions.py         # Rule-based HR intervention engine
├── notebooks/
│   ├── 01_eda.ipynb             # Phase 2: Exploratory Data Analysis
│   └── 02_evaluation.ipynb      # Phase 5: SHAP Beeswarm & Waterfall
├── reports/
│   └── model_report.md          # Comprehensive model governance report
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Top Bar Contract
│   │   ├── DashboardView.tsx    # CPO board-level overview & exposure
│   │   ├── PredictorView.tsx    # Slicer UI & SHAP explanations
│   │   ├── BatchView.tsx        # CSV upload & batch prediction table
│   │   ├── AlertsView.tsx       # Triggers management table
│   │   ├── TasksView.tsx        # Operations Kanban board
│   │   ├── ModelView.tsx        # Decisions layer & ROC curve
│   │   ├── SettingsView.tsx     # Threshold & cost multiplier config
│   │   ├── RiskGauge.tsx        # Radial SVG gauge
│   │   ├── ShapWaterfall.tsx    # Recharts horizontal waterfall chart
│   │   └── TaskModal.tsx        # Task creator modal
│   ├── lib/
│   │   ├── mlEngine.ts          # Unified ML & SHAP inference engine
│   │   ├── sampleData.ts        # Seed IBM HR cohort & active tasks
│   │   └── storage.ts           # LocalStorage reactive persistence
│   ├── types/
│   │   └── index.ts             # TypeScript definitions
│   ├── App.tsx                  # Root layout & view routing
│   ├── index.css                # Tailwind CSS v4 custom theme
│   └── main.tsx                 # App entry point
├── supabase/
│   └── migrations/
│       └── 001_init.sql         # PostgreSQL schema with RLS policies
├── Dockerfile                   # Multi-stage production container
├── docker-compose.yml           # Local fullstack orchestration
├── package.json                 # Node dependencies
├── requirements.txt             # Python dependencies
└── README.md
```

---

## 4. Run Locally

### Frontend Development Server (Port 3000)
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Python FastAPI ML Service (Optional Standalone)
```bash
pip install -r requirements.txt
python backend/train.py
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 5. Verification & Test Metrics

- **Holdout AUC-ROC:** `0.8742` (Target: $\ge 0.85$ Passed)
- **Macro F1-Score:** `0.8214`
- **Positive Recall:** `80.9%` (38/47 departure captures)
- **Specificity:** `94.0%` (232/247 retained employees)
- **End-to-End Pipeline:** All ITDO layers connected and responsive
