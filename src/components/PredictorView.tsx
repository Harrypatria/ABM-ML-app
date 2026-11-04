import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BellRing,
  ClipboardList,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import {
  EmployeeProfile,
  DepartmentType,
  JobRoleType,
  MaritalStatusType,
  BusinessTravelType,
  OverTimeType,
  TaskItem,
} from '../types';
import { predictAttrition } from '../lib/mlEngine';
import { saveAlert, saveEmployee } from '../lib/storage';
import { RiskGauge } from './RiskGauge';
import { ShapWaterfall } from './ShapWaterfall';
import { TaskModal } from './TaskModal';
import { EmployeePickerModal } from './EmployeePickerModal';

const PRESETS: Record<string, Partial<EmployeeProfile>> = {
  highRisk: {
    fullName: 'David Mercer',
    employeeRef: 'EMP-2091',
    age: 28,
    monthlyIncome: 2600,
    jobRole: 'Laboratory Technician',
    department: 'Research & Development',
    jobSatisfaction: 1,
    workLifeBalance: 1,
    environmentSatisfaction: 1,
    stockOptionLevel: 0,
    overTime: 'Yes',
    businessTravel: 'Travel_Frequently',
    distanceFromHome: 24,
    yearsAtCompany: 1,
    yearsInRole: 1,
    yearsSinceLastPromotion: 1,
  },
  stableVeteran: {
    fullName: 'Eleanor Vance',
    employeeRef: 'EMP-3044',
    age: 48,
    monthlyIncome: 14500,
    jobRole: 'Manager',
    department: 'Research & Development',
    jobSatisfaction: 4,
    workLifeBalance: 3,
    environmentSatisfaction: 4,
    stockOptionLevel: 2,
    overTime: 'No',
    businessTravel: 'Travel_Rarely',
    distanceFromHome: 4,
    yearsAtCompany: 11,
    yearsInRole: 7,
    yearsSinceLastPromotion: 2,
  },
  midLevelRisk: {
    fullName: 'Julian Hayes',
    employeeRef: 'EMP-1845',
    age: 34,
    monthlyIncome: 4800,
    jobRole: 'Sales Executive',
    department: 'Sales',
    jobSatisfaction: 2,
    workLifeBalance: 2,
    environmentSatisfaction: 2,
    stockOptionLevel: 0,
    overTime: 'Yes',
    businessTravel: 'Travel_Frequently',
    distanceFromHome: 14,
    yearsAtCompany: 3,
    yearsInRole: 2,
    yearsSinceLastPromotion: 3,
  },
  benchmarkMedian: {
    fullName: 'Taylor Morgan',
    employeeRef: 'EMP-1470',
    age: 36,
    monthlyIncome: 4900,
    jobRole: 'Research Scientist',
    department: 'Research & Development',
    jobSatisfaction: 3,
    workLifeBalance: 3,
    environmentSatisfaction: 3,
    stockOptionLevel: 1,
    overTime: 'No',
    businessTravel: 'Travel_Rarely',
    distanceFromHome: 7,
    yearsAtCompany: 5,
    yearsInRole: 3,
    yearsSinceLastPromotion: 1,
  },
};

export const PredictorView: React.FC = () => {
  // Employee form state
  const [profile, setProfile] = useState<EmployeeProfile>({
    id: 'emp-pred-curr',
    employeeRef: 'EMP-1042',
    fullName: 'Alex Vance',
    age: 29,
    gender: 'Male',
    maritalStatus: 'Single',
    distanceFromHome: 22,
    department: 'Research & Development',
    jobRole: 'Laboratory Technician',
    jobLevel: 1,
    jobInvolvement: 2,
    monthlyIncome: 2850,
    stockOptionLevel: 0,
    percentSalaryHike: 12,
    jobSatisfaction: 1,
    workLifeBalance: 1,
    environmentSatisfaction: 1,
    relationshipSatisfaction: 2,
    yearsAtCompany: 1,
    yearsInRole: 1,
    yearsSinceLastPromotion: 0,
    yearsWithCurrManager: 1,
    totalWorkingYears: 4,
    numCompaniesWorked: 3,
    performanceRating: 3,
    trainingTimesLastYear: 1,
    overTime: 'Yes',
    businessTravel: 'Travel_Frequently',
  });

  // Debounced prediction state
  const [debouncedProfile, setDebouncedProfile] = useState<EmployeeProfile>(profile);
  const [savedAlertFeedback, setSavedAlertFeedback] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);

  // 300ms debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedProfile(profile);
    }, 300);
    return () => clearTimeout(handler);
  }, [profile]);

  const prediction = useMemo(() => {
    return predictAttrition(debouncedProfile);
  }, [debouncedProfile]);

  const updateField = <K extends keyof EmployeeProfile>(field: K, value: EmployeeProfile[K]) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const applyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setProfile((prev) => ({ ...prev, ...preset }));
    }
  };

  const handleSelectFromDataset = (emp: EmployeeProfile) => {
    setProfile(emp);
  };

  const handleSaveToAlerts = () => {
    saveEmployee(profile);
    saveAlert({
      id: `alt-${Date.now().toString(36)}`,
      predictionId: prediction.id,
      employeeId: profile.id,
      employeeRef: profile.employeeRef,
      employeeName: profile.fullName,
      department: profile.department,
      jobRole: profile.jobRole,
      attritionProbability: prediction.attritionProbability,
      riskLevel: prediction.riskLevel,
      threshold: 0.70,
      status: 'OPEN',
      assignedTo: 'Marcus Vance (Senior HRBP, Engineering & R&D)',
      topDriver: `${prediction.topRiskFactors[0]?.feature}: ${prediction.topRiskFactors[0]?.featureValue}`,
      notes: 'Logged directly from Attrition Slicer UI exploration.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setSavedAlertFeedback(true);
    setTimeout(() => setSavedAlertFeedback(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Title & Preset Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">
            Flight Risk Simulator
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Adjust workplace levers to evaluate real-time SHAP attributions and test retention scenarios.
          </p>
        </div>

        {/* Preset Selector & Quick Pick from Attached Dataset */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPickerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100 transition-colors shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>Select Employee from 1,470 Cohort</span>
          </button>

          <span className="text-xs text-slate-300 hidden sm:inline">|</span>

          <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
            Presets:
          </span>
          <button
            onClick={() => applyPreset('highRisk')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors whitespace-nowrap cursor-pointer"
          >
            High Risk
          </button>
          <button
            onClick={() => applyPreset('midLevelRisk')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors whitespace-nowrap cursor-pointer"
          >
            Moderate Risk
          </button>
          <button
            onClick={() => applyPreset('stableVeteran')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors whitespace-nowrap cursor-pointer"
          >
            Stable Leader
          </button>
          <button
            onClick={() => applyPreset('benchmarkMedian')}
            className="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* Dataset Context Banner */}
      {profile.actualAttrition !== undefined && (
        <div className="mb-6 p-4 rounded-2xl border border-cyan-200 bg-cyan-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900">{profile.fullName}</span>
            <span className="font-mono text-slate-500">({profile.employeeRef})</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-700">{profile.jobRole} ({profile.department})</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600">Historical Status:</span>
            {profile.actualAttrition === 'Yes' ? (
              <span className="px-2 py-0.5 rounded font-mono font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                Departed (Ground Truth: Yes)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Retained (Ground Truth: No)
              </span>
            )}
          </div>
          <span className="text-[11px] text-cyan-800 font-medium">
            💡 Adjust levers below to test what could reduce departure probability.
          </span>
        </div>
      )}

      {/* 2-Column Split: Left Slicers (60%), Right Results (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Feature Slicers */}
        <div className="lg:col-span-7 space-y-6">
          {/* Identity Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              01. Employee Profile & Department
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={profile.employeeRef}
                  onChange={(e) => updateField('employeeRef', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={profile.department}
                  onChange={(e) => updateField('department', e.target.value as DepartmentType)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                >
                  <option value="Research & Development">Research & Development</option>
                  <option value="Sales">Sales</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Role</label>
                <select
                  value={profile.jobRole}
                  onChange={(e) => updateField('jobRole', e.target.value as JobRoleType)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                >
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="Research Scientist">Research Scientist</option>
                  <option value="Laboratory Technician">Laboratory Technician</option>
                  <option value="Manufacturing Director">Manufacturing Director</option>
                  <option value="Healthcare Representative">Healthcare Representative</option>
                  <option value="Manager">Manager</option>
                  <option value="Sales Representative">Sales Representative</option>
                  <option value="Research Director">Research Director</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Level (1 - 5)</label>
                <select
                  value={profile.jobLevel}
                  onChange={(e) => updateField('jobLevel', parseInt(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                >
                  <option value={1}>Level 1 (Entry)</option>
                  <option value={2}>Level 2 (Associate)</option>
                  <option value={3}>Level 3 (Senior)</option>
                  <option value={4}>Level 4 (Lead)</option>
                  <option value={5}>Level 5 (Executive)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Group 1: Workload & Overtime */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                02. Workload & Business Travel
              </h3>
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Primary SHAP Impact Feature
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Frequent Overtime Requirement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('overTime', 'Yes')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      profile.overTime === 'Yes'
                        ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Yes (High Fatigue)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('overTime', 'No')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      profile.overTime === 'No'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    No (Standard Hours)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Business Travel Cadence
                </label>
                <select
                  value={profile.businessTravel}
                  onChange={(e) => updateField('businessTravel', e.target.value as BusinessTravelType)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                >
                  <option value="Non-Travel">Non-Travel</option>
                  <option value="Travel_Rarely">Travel Rarely (1-2x/quarter)</option>
                  <option value="Travel_Frequently">Travel Frequently (&gt;2x/month)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Distance from Home</span>
                <span className="font-mono text-slate-900 font-bold tabular-nums">
                  {profile.distanceFromHome} miles
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={profile.distanceFromHome}
                onChange={(e) => updateField('distanceFromHome', parseInt(e.target.value))}
                className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Group 2: Compensation & Equity */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              03. Compensation & Equity Participation
            </h3>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Monthly Base Income</span>
                <span className="font-mono text-cyan-800 font-bold text-sm tabular-nums">
                  ${profile.monthlyIncome.toLocaleString()} / month
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="20000"
                step="250"
                value={profile.monthlyIncome}
                onChange={(e) => updateField('monthlyIncome', parseInt(e.target.value))}
                className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                <span>$1,000 (Entry)</span>
                <span>$4,900 (Company Median)</span>
                <span>$20,000 (Exec)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Stock Option Tier
                </label>
                <select
                  value={profile.stockOptionLevel}
                  onChange={(e) => updateField('stockOptionLevel', parseInt(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                >
                  <option value={0}>Level 0 (No Equity Grant)</option>
                  <option value={1}>Level 1 (Standard Grant)</option>
                  <option value={2}>Level 2 (Senior Equity)</option>
                  <option value={3}>Level 3 (Executive Vesting)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Recent Salary Hike</span>
                  <span className="font-mono text-slate-900 font-bold tabular-nums">
                    {profile.percentSalaryHike}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  value={profile.percentSalaryHike}
                  onChange={(e) => updateField('percentSalaryHike', parseInt(e.target.value))}
                  className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer mt-2"
                />
              </div>
            </div>
          </div>

          {/* Group 3: Satisfaction & Sentiment */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              04. Satisfaction & Workplace Wellbeing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Job Satisfaction</span>
                  <span className="font-mono text-slate-900 font-bold tabular-nums">
                    {profile.jobSatisfaction} / 4
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={profile.jobSatisfaction}
                  onChange={(e) => updateField('jobSatisfaction', parseInt(e.target.value))}
                  className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Work-Life Balance</span>
                  <span className="font-mono text-slate-900 font-bold tabular-nums">
                    {profile.workLifeBalance} / 4
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={profile.workLifeBalance}
                  onChange={(e) => updateField('workLifeBalance', parseInt(e.target.value))}
                  className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Environment Satisfaction</span>
                  <span className="font-mono text-slate-900 font-bold tabular-nums">
                    {profile.environmentSatisfaction} / 4
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={profile.environmentSatisfaction}
                  onChange={(e) => updateField('environmentSatisfaction', parseInt(e.target.value))}
                  className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Relationship Satisfaction</span>
                  <span className="font-mono text-slate-900 font-bold tabular-nums">
                    {profile.relationshipSatisfaction} / 4
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={profile.relationshipSatisfaction}
                  onChange={(e) => updateField('relationshipSatisfaction', parseInt(e.target.value))}
                  className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Group 4: Tenure & Career History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              05. Tenure & Career Trajectory
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Years at Company</span>
                  <span className="font-mono text-slate-900 font-bold tabular-nums">
                    {profile.yearsAtCompany} yrs
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={profile.yearsAtCompany}
                  onChange={(e) => updateField('yearsAtCompany', parseInt(e.target.value))}
                  className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Years in Current Role</span>
                  <span className="font-mono text-slate-900 font-bold tabular-nums">
                    {profile.yearsInRole} yrs
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="18"
                  value={profile.yearsInRole}
                  onChange={(e) => updateField('yearsInRole', parseInt(e.target.value))}
                  className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Years Since Last Promotion</span>
                  <span className="font-mono text-slate-900 font-bold tabular-nums">
                    {profile.yearsSinceLastPromotion} yrs
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={profile.yearsSinceLastPromotion}
                  onChange={(e) => updateField('yearsSinceLastPromotion', parseInt(e.target.value))}
                  className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Prior Companies Worked</span>
                  <span className="font-mono text-slate-900 font-bold tabular-nums">
                    {profile.numCompaniesWorked}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="9"
                  value={profile.numCompaniesWorked}
                  onChange={(e) => updateField('numCompaniesWorked', parseInt(e.target.value))}
                  className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Output, Gauge, SHAP Waterfall & Action */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          {/* Main Risk Prediction Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Calibrated Prediction
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                GradientBoosting v1.0
              </span>
            </div>

            {/* Radial SVG Gauge */}
            <div className="py-2">
              <RiskGauge
                probability={prediction.attritionProbability}
                riskLevel={prediction.riskLevel}
                size={200}
              />
            </div>

            {/* ITDO Trigger Bar */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">70% Critical Threshold Status</div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  {prediction.attritionProbability >= 0.70
                    ? 'Immediate HRBP intervention recommended.'
                    : 'Within manageable retention boundaries.'}
                </div>
              </div>
              <span
                className={`font-mono font-bold text-xs px-2.5 py-1 rounded-full border ${
                  prediction.attritionProbability >= 0.70
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}
              >
                {prediction.attritionProbability >= 0.70 ? 'TRIGGER FIRED' : 'NORMAL'}
              </span>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveToAlerts}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Save to Alerts</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTaskModalOpen(true)}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Assign Task</span>
              </button>
            </div>

            {savedAlertFeedback && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-center gap-1.5 animate-fadeIn font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Alert saved to Triggers queue!</span>
              </div>
            )}
          </div>

          {/* Local SHAP Waterfall */}
          <ShapWaterfall
            factors={prediction.topRiskFactors}
            baseValue={prediction.baseValue}
            finalProbability={prediction.attritionProbability}
          />

          {/* Prescribed Retentive Interventions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recommended Retention Actions
            </h4>
            <div className="space-y-2">
              {prediction.suggestedInterventions.map((intervention, index) => {
                const isOpen = activeAccordion === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/60"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveAccordion(isOpen ? null : index)}
                      className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:text-cyan-800 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-mono text-[10px] font-bold">
                          {index + 1}
                        </span>
                        <span className="line-clamp-1">{intervention}</span>
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                          isOpen ? 'rotate-180 text-cyan-700' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5 bg-white flex flex-col gap-2">
                        <p className="leading-relaxed">{intervention}</p>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setIsTaskModalOpen(true)}
                            className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 cursor-pointer"
                          >
                            Assign to HRBP Task Board →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={() => {
          // Handled via storage update event
        }}
        initialData={{
          employeeId: profile.id,
          employeeRef: profile.employeeRef,
          employeeName: profile.fullName,
          intervention: prediction.suggestedInterventions[0],
          priority: prediction.riskLevel === 'HIGH' ? 'CRITICAL' : 'HIGH',
        }}
      />

      {/* Employee Picker Modal for 1,470 Attached Dataset */}
      <EmployeePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectFromDataset}
      />
    </div>
  );
};
