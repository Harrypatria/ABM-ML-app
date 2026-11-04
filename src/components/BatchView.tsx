import React, { useState, useMemo, useEffect } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Eye,
  BellRing,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Database,
  RefreshCw,
  Sliders,
  AlertOctagon,
} from 'lucide-react';
import { EmployeeProfile, PredictionResult, DepartmentType } from '../types';
import { getEmployees, saveBatchEmployees, saveAlert, initDatasetFromAttachedCsv } from '../lib/storage';
import { predictAttrition } from '../lib/mlEngine';
import { parseHrCsv } from '../lib/csvLoader';
import { ShapWaterfall } from './ShapWaterfall';
import { TaskModal } from './TaskModal';

interface BatchViewProps {
  onSelectEmployeeForSimulation?: (employee: EmployeeProfile) => void;
}

export const BatchView: React.FC<BatchViewProps> = ({ onSelectEmployeeForSimulation }) => {
  const [employees, setEmployees] = useState<EmployeeProfile[]>(getEmployees());
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedAttrition, setSelectedAttrition] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'prob_desc' | 'prob_asc' | 'income_desc' | 'tenure_desc'>('prob_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isLoadingDataset, setIsLoadingDataset] = useState(false);

  const [inspectedEmployee, setInspectedEmployee] = useState<{
    profile: EmployeeProfile;
    prediction: PredictionResult;
  } | null>(null);
  const [taskModalData, setTaskModalData] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync employees on load or when updated
  const refreshData = () => {
    setEmployees(getEmployees());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('app_storage_updated', refreshData);
    return () => window.removeEventListener('app_storage_updated', refreshData);
  }, []);

  // Score all employees
  const scoredList = useMemo(() => {
    return employees.map((emp) => ({
      profile: emp,
      prediction: predictAttrition(emp),
    }));
  }, [employees]);

  // Aggregate stats across the loaded cohort
  const cohortStats = useMemo(() => {
    const total = scoredList.length;
    const actualExits = scoredList.filter((s) => s.profile.actualAttrition === 'Yes').length;
    const highRiskCount = scoredList.filter((s) => s.prediction.riskLevel === 'HIGH').length;
    const avgSalary = total > 0 ? scoredList.reduce((acc, c) => acc + c.profile.monthlyIncome, 0) / total : 0;
    return {
      total,
      actualExits,
      actualExitRate: total > 0 ? (actualExits / total) * 100 : 0,
      highRiskCount,
      avgSalary,
    };
  }, [scoredList]);

  // Filtered and Sorted
  const filteredList = useMemo(() => {
    return scoredList
      .filter((item) => {
        const matchesSearch =
          item.profile.fullName.toLowerCase().includes(search.toLowerCase()) ||
          item.profile.employeeRef.toLowerCase().includes(search.toLowerCase()) ||
          item.profile.jobRole.toLowerCase().includes(search.toLowerCase());

        const matchesDept = selectedDept === 'ALL' || item.profile.department === selectedDept;
        const matchesRisk = selectedRisk === 'ALL' || item.prediction.riskLevel === selectedRisk;
        const matchesAttrition =
          selectedAttrition === 'ALL' ||
          (selectedAttrition === 'Yes' && item.profile.actualAttrition === 'Yes') ||
          (selectedAttrition === 'No' && item.profile.actualAttrition !== 'Yes');

        return matchesSearch && matchesDept && matchesRisk && matchesAttrition;
      })
      .sort((a, b) => {
        if (sortBy === 'prob_desc') {
          return b.prediction.attritionProbability - a.prediction.attritionProbability;
        }
        if (sortBy === 'prob_asc') {
          return a.prediction.attritionProbability - b.prediction.attritionProbability;
        }
        if (sortBy === 'income_desc') {
          return b.profile.monthlyIncome - a.profile.monthlyIncome;
        }
        if (sortBy === 'tenure_desc') {
          return b.profile.yearsAtCompany - a.profile.yearsAtCompany;
        }
        return 0;
      });
  }, [scoredList, search, selectedDept, selectedRisk, selectedAttrition, sortBy]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDept, selectedRisk, selectedAttrition, sortBy, pageSize]);

  // Pagination slice
  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reload attached CSV from public assets
  const handleReloadAttachedDataset = async () => {
    setIsLoadingDataset(true);
    try {
      const data = await initDatasetFromAttachedCsv(true);
      setEmployees(data);
      showToast(`Successfully reloaded ${data.length.toLocaleString()} employee records from attached dataset.`);
    } catch {
      showToast('Unable to load attached dataset. Please check the file path.');
    } finally {
      setIsLoadingDataset(false);
    }
  };

  // CSV Drag and drop or file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseHrCsv(text);
        if (parsed.length === 0) {
          showToast('The uploaded CSV does not contain valid employee records.');
          return;
        }

        saveBatchEmployees(parsed);
        setEmployees(getEmployees());
        showToast(`Successfully imported ${parsed.length.toLocaleString()} employees.`);
      } catch {
        showToast('Failed to parse CSV file. Please verify columns match the benchmark format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Export scored dataset as CSV
  const handleExportCSV = () => {
    const headers = [
      'EmployeeID',
      'FullName',
      'Department',
      'JobRole',
      'Age',
      'MonthlyIncome',
      'OverTime',
      'YearsAtCompany',
      'ActualAttrition_Historical',
      'Predicted_Flight_Probability',
      'Risk_Level',
      'Primary_Driver',
    ];

    const rows = filteredList.map((item) => [
      `"${item.profile.employeeRef}"`,
      `"${item.profile.fullName}"`,
      `"${item.profile.department}"`,
      `"${item.profile.jobRole}"`,
      item.profile.age,
      item.profile.monthlyIncome,
      `"${item.profile.overTime}"`,
      item.profile.yearsAtCompany,
      `"${item.profile.actualAttrition || 'N/A'}"`,
      (item.prediction.attritionProbability * 100).toFixed(1) + '%',
      item.prediction.riskLevel,
      `"${item.prediction.topRiskFactors[0]?.description.replace(/"/g, '""') || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Retention_Scored_Cohort_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger alert
  const handleCreateAlert = (item: (typeof scoredList)[0]) => {
    saveAlert({
      id: `alt-${Date.now().toString(36)}`,
      predictionId: item.prediction.id,
      employeeId: item.profile.id,
      employeeRef: item.profile.employeeRef,
      employeeName: item.profile.fullName,
      department: item.profile.department,
      jobRole: item.profile.jobRole,
      attritionProbability: item.prediction.attritionProbability,
      riskLevel: item.prediction.riskLevel,
      threshold: 0.70,
      status: 'OPEN',
      assignedTo: 'Marcus Vance (Senior HRBP, Engineering & R&D)',
      topDriver: item.prediction.topRiskFactors[0]?.description || 'Multiple High Risk Indicators',
      notes: `Batch flagged. Historical Status: ${item.profile.actualAttrition === 'Yes' ? 'Departed' : 'Active'}.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    showToast(`Risk alert created for ${item.profile.fullName}.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-2xl shadow-xl text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Dataset Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-display font-bold text-slate-900">
              Cohort Explorer & Batch Scoring
            </h2>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>1,470 Benchmark Records</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Explore your full workforce cohort, compare predicted probabilities against historical departure labels, and export reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Reload attached CSV button */}
          <button
            onClick={handleReloadAttachedDataset}
            disabled={isLoadingDataset}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoadingDataset ? 'animate-spin text-cyan-600' : ''}`} />
            <span>Reload Attached CSV</span>
          </button>

          {/* Upload Custom CSV */}
          <label className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 cursor-pointer transition-colors whitespace-nowrap shadow-2xs">
            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
            <span>Upload New CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Export Scored */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV ({filteredList.length.toLocaleString()})</span>
          </button>
        </div>
      </div>

      {/* Cohort Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Headcount</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {cohortStats.total.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Benchmark dataset cohort</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Historical Departures</div>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-1 tabular-nums">
            {cohortStats.actualExits.toLocaleString()} ({cohortStats.actualExitRate.toFixed(1)}%)
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Ground-truth label in CSV</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Predicted High Risk</div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
            {cohortStats.highRiskCount} Employees
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Probability &gt; 70% threshold</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Average Monthly Salary</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            ${Math.round(cohortStats.avgSalary).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Workforce compensation baseline</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by employee name, role, or ID (e.g. EMP-0001)..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Status Attrisi Aktual (Ground Truth) */}
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-semibold text-slate-700">Historical:</span>
            <select
              value={selectedAttrition}
              onChange={(e) => setSelectedAttrition(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-cyan-600"
            >
              <option value="ALL">All ({cohortStats.total})</option>
              <option value="Yes">Departed (237)</option>
              <option value="No">Retained (1,233)</option>
            </select>
          </div>

          {/* Department */}
          <div className="flex items-center gap-1.5 text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700">Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-cyan-600"
            >
              <option value="ALL">All Departments</option>
              <option value="Research & Development">Research & Development</option>
              <option value="Sales">Sales</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          </div>

          {/* Model Risk */}
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-semibold text-slate-700">Risk:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-cyan-600"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="HIGH">High (&gt;70%)</option>
              <option value="MEDIUM">Moderate (40-70%)</option>
              <option value="LOW">Low (&lt;40%)</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5 text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-cyan-600 font-mono text-[11px]"
            >
              <option value="prob_desc">Probability (Highest)</option>
              <option value="prob_asc">Probability (Lowest)</option>
              <option value="income_desc">Monthly Income (Highest)</option>
              <option value="tenure_desc">Company Tenure (Highest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cohort Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Department & Role</th>
                <th className="px-4 py-3.5">Monthly Income</th>
                <th className="px-4 py-3.5">Overtime</th>
                <th className="px-4 py-3.5">Historical Status</th>
                <th className="px-4 py-3.5">Predicted Risk</th>
                <th className="px-4 py-3.5">Primary SHAP Driver</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500 text-xs">
                    No employees found matching your criteria. Try resetting filters or search query.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => {
                  const probPct = Math.round(item.prediction.attritionProbability * 100);
                  const isHigh = item.prediction.riskLevel === 'HIGH';
                  const isMed = item.prediction.riskLevel === 'MEDIUM';
                  const topDriver = item.prediction.topRiskFactors[0];
                  const isActualDeparted = item.profile.actualAttrition === 'Yes';

                  return (
                    <tr
                      key={item.profile.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Employee Ref & Name */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{item.profile.fullName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{item.profile.employeeRef}</div>
                      </td>

                      {/* Dept & Role */}
                      <td className="px-4 py-3.5">
                        <div className="text-slate-800 font-medium">{item.profile.jobRole}</div>
                        <div className="text-[11px] text-slate-500">{item.profile.department}</div>
                      </td>

                      {/* Monthly Income */}
                      <td className="px-4 py-3.5 font-mono text-slate-900 tabular-nums">
                        ${item.profile.monthlyIncome.toLocaleString()}
                      </td>

                      {/* Overtime */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`font-mono text-[11px] font-semibold ${
                            item.profile.overTime === 'Yes' ? 'text-rose-700' : 'text-slate-600'
                          }`}
                        >
                          {item.profile.overTime}
                        </span>
                      </td>

                      {/* Ground Truth Status from CSV */}
                      <td className="px-4 py-3.5">
                        {isActualDeparted ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                            <AlertOctagon className="w-3 h-3 text-rose-600" />
                            <span>Departed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Retained</span>
                          </span>
                        )}
                      </td>

                      {/* Probability & Badge */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold text-sm tabular-nums ${
                              isHigh ? 'text-rose-700' : isMed ? 'text-amber-700' : 'text-emerald-700'
                            }`}
                          >
                            {probPct}%
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              isHigh
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : isMed
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {item.prediction.riskLevel}
                          </span>
                        </div>
                      </td>

                      {/* Top Driver */}
                      <td className="px-4 py-3.5 max-w-[220px]">
                        {topDriver ? (
                          <div
                            className="text-[11px] truncate text-slate-700"
                            title={topDriver.description}
                          >
                            <span
                              className={`font-semibold mr-1 ${
                                topDriver.direction === 'increases' ? 'text-rose-700' : 'text-emerald-700'
                              }`}
                            >
                              {topDriver.direction === 'increases' ? '▲' : '▼'} {topDriver.feature}:
                            </span>
                            <span className="text-slate-500">{topDriver.featureValue}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectedEmployee(item)}
                            title="Inspect SHAP Explanation"
                            className="p-1.5 text-slate-500 hover:text-cyan-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleCreateAlert(item)}
                            title="Create Risk Alert"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <BellRing className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>
              Showing{' '}
              <span className="font-semibold text-slate-900">
                {filteredList.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-slate-900">
                {Math.min(currentPage * pageSize, filteredList.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-900">{filteredList.length.toLocaleString()}</span> employees
            </span>

            <span className="text-slate-300">|</span>

            <span className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-slate-800 focus:outline-none focus:border-cyan-600 font-mono text-xs"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="font-mono text-xs text-slate-700 px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SHAP Inspection Drawer / Modal */}
      {inspectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>SHAP Root Cause Explanation: {inspectedEmployee.profile.fullName}</span>
                  <span className="font-mono text-xs text-slate-500">({inspectedEmployee.profile.employeeRef})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {inspectedEmployee.profile.jobRole} · {inspectedEmployee.profile.department} · Historical Status:{' '}
                  <span className={inspectedEmployee.profile.actualAttrition === 'Yes' ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                    {inspectedEmployee.profile.actualAttrition === 'Yes' ? 'Departed (Yes)' : 'Retained (No)'}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setInspectedEmployee(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Risk Summary Badge */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flight Risk Assessment</div>
                  <div
                    className={`text-xl font-bold font-mono mt-0.5 ${
                      inspectedEmployee.prediction.riskLevel === 'HIGH'
                        ? 'text-rose-700'
                        : inspectedEmployee.prediction.riskLevel === 'MEDIUM'
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {(inspectedEmployee.prediction.attritionProbability * 100).toFixed(1)}% (
                    {inspectedEmployee.prediction.riskLevel} Risk)
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Benchmark Baseline</div>
                  <div className="text-base font-mono font-bold text-slate-700">16.1%</div>
                </div>
              </div>

              {/* Waterfall Chart */}
              <div>
                <ShapWaterfall
                  factors={inspectedEmployee.prediction.topRiskFactors}
                  baseValue={inspectedEmployee.prediction.baseValue}
                  finalProbability={inspectedEmployee.prediction.attritionProbability}
                />
              </div>

              {/* Prescribed Interventions */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Recommended Retention Action Plan
                </h4>
                <div className="space-y-2">
                  {inspectedEmployee.prediction.suggestedInterventions.map((act, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  handleCreateAlert(inspectedEmployee);
                  setInspectedEmployee(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Create Risk Trigger</span>
              </button>

              <button
                onClick={() => setInspectedEmployee(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
