-- ==============================================================================
-- Migration: 001_init.sql
-- Description: Core Schema for Attrition Predictor Pro (ITDO Architecture)
-- Framework: Insights -> Triggers -> Decisions -> Operations
-- ==============================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: employees
CREATE TABLE IF NOT EXISTS employees (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_ref    text NOT NULL UNIQUE,
  full_name       text NOT NULL,
  department      text NOT NULL,
  job_role        text NOT NULL,
  job_level       int DEFAULT 1,
  monthly_income  numeric(10,2) NOT NULL,
  hire_date       date DEFAULT CURRENT_DATE,
  manager_id      uuid REFERENCES employees(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Table 2: predictions (ITDO: Insights Layer)
CREATE TABLE IF NOT EXISTS predictions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id             uuid REFERENCES employees(id) ON DELETE CASCADE,
  attrition_probability   numeric(5,4) NOT NULL CHECK (attrition_probability >= 0 AND attrition_probability <= 1),
  risk_level              text NOT NULL CHECK (risk_level IN ('LOW','MEDIUM','HIGH')),
  top_risk_factors        jsonb NOT NULL DEFAULT '[]'::jsonb,
  suggested_interventions jsonb NOT NULL DEFAULT '[]'::jsonb,
  shap_base_value         numeric(5,4) DEFAULT 0.1610,
  model_version           text NOT NULL DEFAULT '1.0.0',
  created_by              uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at              timestamptz NOT NULL DEFAULT now()
);

-- Table 3: alerts (ITDO: Triggers Layer)
CREATE TABLE IF NOT EXISTS alerts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id   uuid REFERENCES predictions(id) ON DELETE CASCADE,
  employee_id     uuid REFERENCES employees(id) ON DELETE CASCADE,
  threshold       numeric(5,4) NOT NULL DEFAULT 0.7000,
  status          text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','ACKNOWLEDGED','RESOLVED')),
  assigned_to     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_name   text,
  notes           text,
  resolved_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Table 4: tasks (ITDO: Operations Layer)
CREATE TABLE IF NOT EXISTS tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id        uuid REFERENCES alerts(id) ON DELETE SET NULL,
  employee_id     uuid REFERENCES employees(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text,
  intervention    text NOT NULL,
  priority        text NOT NULL DEFAULT 'HIGH' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status          text NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO','IN_PROGRESS','DONE','CANCELLED')),
  due_date        date,
  assigned_to     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_name   text,
  created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE employees   ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks       ENABLE ROW LEVEL SECURITY;

-- Base RLS Policies: Authenticated users can read and write within organization
CREATE POLICY "Authenticated users can select employees" ON employees
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage employees" ON employees
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view predictions" ON predictions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create predictions" ON predictions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view and update alerts" ON alerts
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view and update tasks" ON tasks
  FOR ALL TO authenticated USING (true);

-- Indexes for performant filtering
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department);
CREATE INDEX IF NOT EXISTS idx_predictions_employee ON predictions(employee_id);
CREATE INDEX IF NOT EXISTS idx_predictions_risk ON predictions(risk_level);
CREATE INDEX IF NOT EXISTS idx_predictions_created ON predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_employee ON alerts(employee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
