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

  // 300ms debounce as specified in prompt
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
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Title & Preset Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-100">
            Interactive Employee Flight Predictor
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ITDO Insights Layer · Adjust individual levers to view real-time calibrated SHAP attributions
          </p>
        </div>

        {/* Preset Selector & Quick Pick from Attached Dataset */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPickerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pilih Karyawan dari Data Lampiran (1.470 Data)</span>
          </button>

          <span className="text-xs text-slate-500 hidden sm:inline">|</span>

          <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
            Preset:
          </span>
          <button
            onClick={() => applyPreset('highRisk')}
            className="px-2.5 py-1 text-xs font-medium rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors whitespace-nowrap"
          >
            High Risk
          </button>
          <button
            onClick={() => applyPreset('midLevelRisk')}
            className="px-2.5 py-1 text-xs font-medium rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors whitespace-nowrap"
          >
            Mid Risk
          </button>
          <button
            onClick={() => applyPreset('stableVeteran')}
            className="px-2.5 py-1 text-xs font-medium rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors whitespace-nowrap"
          >
            Stable Leader
          </button>
          <button
            onClick={() => applyPreset('benchmarkMedian')}
            className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded transition-colors whitespace-nowrap flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* Dataset Context Banner */}
      {profile.actualAttrition !== undefined && (
        <div className="mb-6 p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-cyan-300">{profile.fullName} ({profile.employeeRef})</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">{profile.jobRole} ({profile.department})</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">Status Aktual di File CSV:</span>
            {profile.actualAttrition === 'Yes' ? (
              <span className="px-2 py-0.5 rounded font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Keluar (Attrition = Yes)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Aktif (Attrition = No)
              </span>
            )}
          </div>
          <span className="text-[11px] text-cyan-400 font-mono">
            💡 Ubah tuas di bawah untuk simulasi skenario retensi (What-If)
          </span>
        </div>
      )}

      {/* 2-Column Split: Left Slicers (60%), Right Results (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Feature Slicers */}
        <div className="lg:col-span-7 space-y-6">
          {/* Identity Section */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 text-[11px]">
              01. Employee Profile & Role
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Employee Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Employee Reference</label>
                <input
                  type="text"
                  value={profile.employeeRef}
                  onChange={(e) => updateField('employeeRef', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                <select
                  value={profile.department}
                  onChange={(e) => updateField('department', e.target.value as DepartmentType)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Research & Development">Research & Development</option>
                  <option value="Sales">Sales</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">Job Role</label>
                <select
                  value={profile.jobRole}
                  onChange={(e) => updateField('jobRole', e.target.value as JobRoleType)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Laboratory Technician">Laboratory Technician</option>
                  <option value="Research Scientist">Research Scientist</option>
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="Sales Representative">Sales Representative</option>
                  <option value="Healthcare Representative">Healthcare Representative</option>
                  <option value="Manufacturing Director">Manufacturing Director</option>
                  <option value="Manager">Manager</option>
                  <option value="Research Director">Research Director</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Marital Status</label>
                <select
                  value={profile.maritalStatus}
                  onChange={(e) => updateField('maritalStatus', e.target.value as MaritalStatusType)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Primary Risk Vectors (Overtime & Travel) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 text-[11px]">
              02. Workload & Travel Stressors
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* OverTime Boolean Toggle */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Overtime Required</div>
                  <div className="text-[11px] text-slate-400">Regular extended hours</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('overTime', profile.overTime === 'Yes' ? 'No' : 'Yes')}
                    className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      profile.overTime === 'Yes' ? 'bg-rose-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        profile.overTime === 'Yes' ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-mono font-bold ${profile.overTime === 'Yes' ? 'text-rose-400' : 'text-slate-400'}`}>
                    {profile.overTime}
                  </span>
                </div>
              </div>

              {/* Business Travel */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Business Travel Cadence
                </label>
                <select
                  value={profile.businessTravel}
                  onChange={(e) => updateField('businessTravel', e.target.value as BusinessTravelType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Non-Travel">Non-Travel (0% Road)</option>
                  <option value="Travel_Rarely">Travel Rarely (&lt;20%)</option>
                  <option value="Travel_Frequently">Travel Frequently (Weekly/Bi-weekly)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Compensation & Tenure Sliders */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-2 text-[11px]">
              03. Compensation & Tenure Levers
            </h3>

            {/* Monthly Income Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Monthly Income ($/month)</span>
                <span className="font-mono text-cyan-400 font-bold tabular-nums">
                  ${profile.monthlyIncome.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1200"
                  max="19500"
                  step="100"
                  value={profile.monthlyIncome}
                  onChange={(e) => updateField('monthlyIncome', Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min="1200"
                  max="25000"
                  step="100"
                  value={profile.monthlyIncome}
                  onChange={(e) => updateField('monthlyIncome', Number(e.target.value))}
                  className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100 text-right tabular-nums"
                />
              </div>
            </div>

            {/* Stock Option Level */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Stock Option Grant Level</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {profile.stockOptionLevel === 0 ? 'Level 0 (No Stock)' : `Level ${profile.stockOptionLevel}`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={profile.stockOptionLevel}
                onChange={(e) => updateField('stockOptionLevel', Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0 (None)</span>
                <span>1 (Standard)</span>
                <span>2 (Senior)</span>
                <span>3 (Exec)</span>
              </div>
            </div>

            {/* Years at Company & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">Years at Company</span>
                  <span className="font-mono text-slate-300 font-bold tabular-nums">
                    {profile.yearsAtCompany} yr{profile.yearsAtCompany === 1 ? '' : 's'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={profile.yearsAtCompany}
                  onChange={(e) => updateField('yearsAtCompany', Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">Years Since Last Promotion</span>
                  <span className="font-mono text-slate-300 font-bold tabular-nums">
                    {profile.yearsSinceLastPromotion} yr{profile.yearsSinceLastPromotion === 1 ? '' : 's'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={profile.yearsSinceLastPromotion}
                  onChange={(e) => updateField('yearsSinceLastPromotion', Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Distance from home */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300">Distance From Home (Miles)</span>
                <span className="font-mono text-slate-300 font-bold tabular-nums">
                  {profile.distanceFromHome} miles
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="35"
                step="1"
                value={profile.distanceFromHome}
                onChange={(e) => updateField('distanceFromHome', Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Satisfaction Metrics (1-4 Scales) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 text-[11px]">
              04. Subjective Sentiment & Wellbeing (1 to 4)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">Job Satisfaction</span>
                  <span className="font-mono font-bold text-cyan-400 tabular-nums">
                    {profile.jobSatisfaction}/4
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={profile.jobSatisfaction}
                  onChange={(e) => updateField('jobSatisfaction', Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">Work Life Balance</span>
                  <span className="font-mono font-bold text-cyan-400 tabular-nums">
                    {profile.workLifeBalance}/4
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={profile.workLifeBalance}
                  onChange={(e) => updateField('workLifeBalance', Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>Bad</span>
                  <span>Best</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">Environment Sat.</span>
                  <span className="font-mono font-bold text-cyan-400 tabular-nums">
                    {profile.environmentSatisfaction}/4
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={profile.environmentSatisfaction}
                  onChange={(e) => updateField('environmentSatisfaction', Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Results & Actions (Sticky) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          {/* Main Risk Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Inference Result
              </span>
              <span className="text-xs font-mono text-slate-500">
                Model: GradientBoost v1.0
              </span>
            </div>

            <div className="my-4 flex justify-center">
              <RiskGauge
                probability={prediction.attritionProbability}
                riskLevel={prediction.riskLevel}
                size={200}
              />
            </div>

            {/* Quick Action Triggers */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={handleSaveToAlerts}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors whitespace-nowrap"
              >
                {savedAlertFeedback ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Saved to Alerts!</span>
                  </>
                ) : (
                  <>
                    <BellRing className="w-3.5 h-3.5 text-amber-400" />
                    <span>Trigger Alert</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors whitespace-nowrap shadow-sm shadow-cyan-500/20"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Create Task</span>
              </button>
            </div>
          </div>

          {/* SHAP Waterfall Chart */}
          <ShapWaterfall
            factors={prediction.topRiskFactors}
            baseValue={prediction.baseValue}
            finalProbability={prediction.attritionProbability}
          />

          {/* Top Risk Contributors List */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Top 5 Contributing Factors
            </h4>
            <div className="space-y-2">
              {prediction.topRiskFactors.map((factor, idx) => {
                const isInc = factor.direction === 'increases';
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/60 border border-slate-800/80"
                  >
                    <div className="flex items-center gap-2">
                      {isInc ? (
                        <TrendingUp className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold text-slate-200">{factor.feature}</div>
                        <div className="text-[11px] text-slate-400">{factor.featureValue}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono font-bold tabular-nums ${
                          isInc ? 'text-rose-400' : 'text-cyan-400'
                        }`}
                      >
                        {isInc ? '+' : ''}
                        {(factor.impact * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suggested Interventions Accordion */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Prescribed Interventions (ITDO Triggers)
            </h4>
            <div className="space-y-2">
              {prediction.suggestedInterventions.map((intervention, index) => {
                const isOpen = activeAccordion === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/60"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveAccordion(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-3 text-left text-xs font-medium text-slate-200 hover:text-cyan-300 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-[10px]">
                          {index + 1}
                        </span>
                        <span className="line-clamp-1">{intervention}</span>
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                          isOpen ? 'rotate-180 text-cyan-400' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3 text-xs text-slate-300 border-t border-slate-800/80 pt-2 bg-slate-900/30 flex flex-col gap-2">
                        <p className="leading-relaxed">{intervention}</p>
                        <div className="flex justify-end">
                          <button
                            onClick={() => setIsTaskModalOpen(true)}
                            className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 underline"
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
