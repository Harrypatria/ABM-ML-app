/**
 * Attrition Predictor Pro - Core Type Definitions
 * Based on the IBM HR Analytics Employee Attrition Dataset & ITDO Framework
 */

export type DepartmentType = 'Sales' | 'Research & Development' | 'Human Resources';

export type JobRoleType =
  | 'Sales Executive'
  | 'Research Scientist'
  | 'Laboratory Technician'
  | 'Manufacturing Director'
  | 'Healthcare Representative'
  | 'Manager'
  | 'Sales Representative'
  | 'Research Director'
  | 'Human Resources';

export type MaritalStatusType = 'Single' | 'Married' | 'Divorced';
export type BusinessTravelType = 'Non-Travel' | 'Travel_Rarely' | 'Travel_Frequently';
export type GenderType = 'Male' | 'Female';
export type OverTimeType = 'Yes' | 'No';

export interface EmployeeProfile {
  id: string;
  employeeRef: string;
  fullName: string;
  age: number;
  gender: GenderType;
  maritalStatus: MaritalStatusType;
  distanceFromHome: number;
  department: DepartmentType;
  jobRole: JobRoleType;
  jobLevel: number; // 1-5
  jobInvolvement: number; // 1-4
  monthlyIncome: number;
  stockOptionLevel: number; // 0-3
  percentSalaryHike: number; // 10-30
  jobSatisfaction: number; // 1-4
  workLifeBalance: number; // 1-4
  environmentSatisfaction: number; // 1-4
  relationshipSatisfaction: number; // 1-4
  yearsAtCompany: number;
  yearsInRole: number;
  yearsSinceLastPromotion: number;
  yearsWithCurrManager: number;
  totalWorkingYears: number;
  numCompaniesWorked: number;
  performanceRating: number; // 3-4
  trainingTimesLastYear: number; // 0-6
  overTime: OverTimeType;
  businessTravel: BusinessTravelType;
  actualAttrition?: 'Yes' | 'No'; // Ground-truth label from attached CSV
  education?: number; // 1-5
  educationField?: string;
  dailyRate?: number;
  hourlyRate?: number;
  monthlyRate?: number;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskFactor {
  feature: string;
  impact: number; // e.g. +0.24 or -0.15
  direction: 'increases' | 'decreases';
  featureValue: string;
  description: string;
}

export interface PredictionResult {
  id: string;
  employeeId: string;
  employeeRef: string;
  employeeName: string;
  attritionProbability: number; // 0.0 - 1.0
  riskLevel: RiskLevel;
  topRiskFactors: RiskFactor[];
  suggestedInterventions: string[];
  baseValue: number; // baseline probability, e.g. 0.161
  createdAt: string;
  model_version: string;
}

export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface AlertItem {
  id: string;
  predictionId: string;
  employeeId: string;
  employeeRef: string;
  employeeName: string;
  department: DepartmentType;
  jobRole: JobRoleType;
  attritionProbability: number;
  riskLevel: RiskLevel;
  threshold: number;
  status: AlertStatus;
  assignedTo: string;
  topDriver: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TaskItem {
  id: string;
  alertId?: string;
  employeeId: string;
  employeeRef: string;
  employeeName: string;
  title: string;
  description: string;
  intervention: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModelMetrics {
  modelName: string;
  aucRoc: number;
  f1Score: number;
  precision: number;
  recall: number;
  accuracy: number;
  trainedAt: string;
  datasetRows: number;
  positiveClassRatio: number;
  topFeatures: { feature: string; importance: number; description: string }[];
  confusionMatrix: {
    trueNegative: number;
    falsePositive: number;
    falseNegative: number;
    truePositive: number;
  };
  rocCurve: { fpr: number; tpr: number }[];
}

export interface AppSettings {
  alertThreshold: number; // default 0.70 (70%)
  costMultiplier: number; // default 1.75x annual salary
  currencySymbol: string;
  hrPartners: string[];
  autoAlertOnHighRisk: boolean;
}
