/**
 * Storage manager for Attrition Predictor Pro
 * Provides persistent state management, auto-seeding, and cross-component reactivity.
 */

import { EmployeeProfile, AlertItem, TaskItem, AppSettings, PredictionResult } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_ALERTS, INITIAL_TASKS, DEFAULT_SETTINGS } from './sampleData';
import { loadAttachedDataset } from './csvLoader';
import { predictAttrition } from './mlEngine';

const KEYS = {
  EMPLOYEES: 'app_employees_v1',
  ALERTS: 'app_alerts_v1',
  TASKS: 'app_tasks_v1',
  SETTINGS: 'app_settings_v1',
  PREDICTIONS: 'app_predictions_v1',
  CSV_LOADED: 'app_csv_attached_loaded_v1',
};

export const StorageEvent = 'app_storage_updated';

function emitUpdate() {
  window.dispatchEvent(new Event(StorageEvent));
}

// EMPLOYEES
export function getEmployees(): EmployeeProfile[] {
  try {
    const raw = localStorage.getItem(KEYS.EMPLOYEES);
    if (!raw) {
      localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
      return INITIAL_EMPLOYEES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EMPLOYEES;
  }
}

export function saveEmployee(employee: EmployeeProfile): void {
  const employees = getEmployees();
  const existingIdx = employees.findIndex((e) => e.id === employee.id);
  if (existingIdx >= 0) {
    employees[existingIdx] = employee;
  } else {
    employees.unshift(employee);
  }
  localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(employees));
  emitUpdate();
}

export function saveBatchEmployees(newEmployees: EmployeeProfile[]): void {
  const current = getEmployees();
  const map = new Map<string, EmployeeProfile>();
  current.forEach((e) => map.set(e.id, e));
  newEmployees.forEach((e) => map.set(e.id, e));
  const merged = Array.from(map.values());
  localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(merged));
  emitUpdate();
}

// ALERTS
export function getAlerts(): AlertItem[] {
  try {
    const raw = localStorage.getItem(KEYS.ALERTS);
    if (!raw) {
      localStorage.setItem(KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
      return INITIAL_ALERTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ALERTS;
  }
}

export function saveAlert(alert: AlertItem): void {
  const alerts = getAlerts();
  const idx = alerts.findIndex((a) => a.id === alert.id);
  if (idx >= 0) {
    alerts[idx] = alert;
  } else {
    alerts.unshift(alert);
  }
  localStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
  emitUpdate();
}

export function updateAlertStatus(id: string, status: AlertItem['status'], notes?: string): void {
  const alerts = getAlerts();
  const alert = alerts.find((a) => a.id === id);
  if (alert) {
    alert.status = status;
    alert.updatedAt = new Date().toISOString();
    if (notes) alert.notes = notes;
    localStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
    emitUpdate();
  }
}

export function bulkAssignAlerts(alertIds: string[], assignee: string): void {
  const alerts = getAlerts();
  alerts.forEach((a) => {
    if (alertIds.includes(a.id)) {
      a.assignedTo = assignee;
      a.updatedAt = new Date().toISOString();
    }
  });
  localStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
  emitUpdate();
}

// TASKS
export function getTasks(): TaskItem[] {
  try {
    const raw = localStorage.getItem(KEYS.TASKS);
    if (!raw) {
      localStorage.setItem(KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TASKS;
  }
}

export function saveTask(task: TaskItem): void {
  const tasks = getTasks();
  const idx = tasks.findIndex((t) => t.id === task.id);
  if (idx >= 0) {
    tasks[idx] = task;
  } else {
    tasks.unshift(task);
  }
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  emitUpdate();
}

export function updateTaskStatus(id: string, status: TaskItem['status']): void {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.status = status;
    task.updatedAt = new Date().toISOString();
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    emitUpdate();
  }
}

export function deleteTask(id: string): void {
  const tasks = getTasks().filter((t) => t.id !== id);
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  emitUpdate();
}

// SETTINGS
export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  emitUpdate();
}

// PREDICTIONS HISTORY
export function getPredictionHistory(): PredictionResult[] {
  try {
    const raw = localStorage.getItem(KEYS.PREDICTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordPrediction(pred: PredictionResult): void {
  const list = getPredictionHistory();
  list.unshift(pred);
  localStorage.setItem(KEYS.PREDICTIONS, JSON.stringify(list.slice(0, 100)));
  emitUpdate();
}

export function isAttachedDatasetLoaded(): boolean {
  try {
    return localStorage.getItem(KEYS.CSV_LOADED) === 'true';
  } catch {
    return false;
  }
}

/**
 * Initializes the full 1,470 employee cohort from the attached CSV
 */
export async function initDatasetFromAttachedCsv(force: boolean = false): Promise<EmployeeProfile[]> {
  try {
    const currentEmployees = getEmployees();
    // If already loaded full dataset and not forcing, return current
    if (!force && currentEmployees.length >= 1000 && isAttachedDatasetLoaded()) {
      return currentEmployees;
    }

    const csvEmployees = await loadAttachedDataset();
    if (csvEmployees.length === 0) {
      return currentEmployees;
    }

    // Save full dataset into localStorage
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(csvEmployees));
    localStorage.setItem(KEYS.CSV_LOADED, 'true');

    // Score all employees and auto-generate alerts for high-risk profiles (> 70%)
    const highRiskList: { emp: EmployeeProfile; pred: PredictionResult }[] = [];
    csvEmployees.forEach((emp) => {
      const pred = predictAttrition(emp);
      if (pred.riskLevel === 'HIGH' && pred.attritionProbability >= 0.70) {
        highRiskList.push({ emp, pred });
      }
    });

    // Sort by risk descending
    highRiskList.sort((a, b) => b.pred.attritionProbability - a.pred.attritionProbability);

    const partners = [
      'Sarah Chen (Director of People Operations)',
      'Marcus Vance (Senior HRBP, Engineering & R&D)',
      'Elena Rostova (Lead HRBP, Sales & Commercial)',
      'David Kim (People Analytics Partner)',
    ];

    // Seed top 12 active triggers for high-risk profiles
    const seededAlerts: AlertItem[] = highRiskList.slice(0, 12).map((item, idx) => {
      const topDriver = item.pred.topRiskFactors[0]?.description || 'OverTime & Low Compensation';
      const assignedTo =
        item.emp.department === 'Sales'
          ? partners[2]
          : item.emp.department === 'Human Resources'
          ? partners[0]
          : partners[1];

      return {
        id: `alert-init-${item.emp.id}-${idx}`,
        predictionId: item.pred.id,
        employeeId: item.emp.id,
        employeeRef: item.emp.employeeRef,
        employeeName: item.emp.fullName,
        department: item.emp.department,
        jobRole: item.emp.jobRole,
        attritionProbability: item.pred.attritionProbability,
        riskLevel: 'HIGH',
        threshold: 0.70,
        status: idx < 5 ? 'OPEN' : idx < 8 ? 'ACKNOWLEDGED' : 'OPEN',
        assignedTo,
        topDriver,
        notes: `Flight risk calculated at ${(item.pred.attritionProbability * 100).toFixed(1)}%. Ground Truth: ${
          item.emp.actualAttrition === 'Yes' ? 'Departed (Historical)' : 'Active'
        }.`,
        createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - idx * 86400000).toISOString(),
      };
    });

    localStorage.setItem(KEYS.ALERTS, JSON.stringify(seededAlerts));

    // Seed key ITDO tasks based on the top 4 critical alerts
    const seededTasks: TaskItem[] = seededAlerts.slice(0, 5).map((alert, idx) => {
      const emp = highRiskList[idx].emp;
      const interventions = highRiskList[idx].pred.suggestedInterventions;
      const intervention = interventions[0] || 'Retention package review & manager 1-on-1';

      const titles = [
        `Compensation Market Equity Review for ${alert.employeeName}`,
        `Workload Rebalancing & Overtime Cap for ${alert.employeeName}`,
        `Career Pathing & Promotion Alignment for ${alert.employeeName}`,
        `Stock Option Grant & Retention Vesting for ${alert.employeeName}`,
        `Executive Stay Interview & Work-Life Audit for ${alert.employeeName}`,
      ];

      return {
        id: `task-init-${alert.employeeId}-${idx}`,
        alertId: alert.id,
        employeeId: alert.employeeId,
        employeeRef: alert.employeeRef,
        employeeName: alert.employeeName,
        title: titles[idx % titles.length],
        description: `Implement proactive retention intervention. Top driver: ${alert.topDriver}. Current salary: $${emp.monthlyIncome}/mo.`,
        intervention,
        priority: idx === 0 ? 'CRITICAL' : idx < 3 ? 'HIGH' : 'MEDIUM',
        status: idx === 0 ? 'IN_PROGRESS' : idx === 1 ? 'TODO' : idx === 2 ? 'TODO' : 'DONE',
        dueDate: new Date(Date.now() + (idx + 2) * 86400000 * 3).toISOString().split('T')[0],
        assignedTo: alert.assignedTo,
        createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    localStorage.setItem(KEYS.TASKS, JSON.stringify(seededTasks));
    emitUpdate();
    return csvEmployees;
  } catch (err) {
    console.error('Failed to initialize dataset from attached CSV:', err);
    return getEmployees();
  }
}

export function resetAllDataToDefault(): void {
  localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
  localStorage.setItem(KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
  localStorage.setItem(KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.removeItem(KEYS.PREDICTIONS);
  localStorage.removeItem(KEYS.CSV_LOADED);
  emitUpdate();
}

