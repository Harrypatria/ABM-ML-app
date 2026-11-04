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
      showToast(`Berhasil memuat ulang ${data.length.toLocaleString()} data karyawan dari file lampiran CSV!`);
    } catch {
      showToast('Gagal memuat dataset dari file lampiran.');
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
          showToast('CSV tidak memiliki format baris data yang valid.');
          return;
        }

        saveBatchEmployees(parsed);
        setEmployees(getEmployees());
        showToast(`Berhasil mengimpor ${parsed.length} data karyawan!`);
      } catch (err) {
        showToast('Gagal memproses file CSV: periksa struktur kolom.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Export scored dataset as CSV
  const handleExportCSV = () => {
    const headers = [
      'EmployeeNumber',
      'FullName',
      'Department',
      'JobRole',
      'Age',
      'MonthlyIncome',
      'OverTime',
      'YearsAtCompany',
      'ActualAttrition_GroundTruth',
      'Predicted_Flight_Probability',
      'Predicted_Risk_Level',
      'Top_SHAP_Driver',
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
    link.setAttribute('download', `Attrition_Predictor_Scored_Cohort_${Date.now()}.csv`);
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
      notes: `Batch flagged. Actual Status: ${item.profile.actualAttrition === 'Yes' ? 'Departed' : 'Active'}.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    showToast(`Peringatan risiko retensi dibuat untuk ${item.profile.fullName}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-200 px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Dataset Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-display font-bold text-slate-100">
              Batch Scoring & Data Explorer
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>1.470 Data Lampiran Aktif</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Eksplorasi kohort karyawan IBM HR Analytics, evaluasi probabilitas model ML, dan analisis perbandingan ground-truth.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Reload attached CSV button */}
          <button
            onClick={handleReloadAttachedDataset}
            disabled={isLoadingDataset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDataset ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Muat Ulang CSV Lampiran</span>
          </button>

          {/* Upload Custom CSV */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer transition-colors whitespace-nowrap">
            <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
            <span>Upload CSV Lain</span>
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Hasil ({filteredList.length})</span>
          </button>
        </div>
      </div>

      {/* Cohort Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Kohort</div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1 tabular-nums">
            {cohortStats.total.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Basis data IBM HR</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Historis Keluar (CSV)</div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
            {cohortStats.actualExits.toLocaleString()} ({cohortStats.actualExitRate.toFixed(1)}%)
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ground-truth label</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Terdeteksi Risiko Tinggi</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {cohortStats.highRiskCount} Karyawan
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Probabilitas &gt; 70%</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Rata-rata Gaji Bulanan</div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1 tabular-nums">
            ${Math.round(cohortStats.avgSalary).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Tolak ukur kompensasi</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, peran (Job Role), atau nomor induk (EMP-0001)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Status Attrisi Aktual (Ground Truth) */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Status CSV:</span>
            <select
              value={selectedAttrition}
              onChange={(e) => setSelectedAttrition(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Semua ({cohortStats.total})</option>
              <option value="Yes">Keluar (237)</option>
              <option value="No">Aktif (1.233)</option>
            </select>
          </div>

          {/* Department */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Semua Departemen</option>
              <option value="Research & Development">Research & Development</option>
              <option value="Sales">Sales</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          </div>

          {/* Model Risk */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Model Risk:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Semua Tingkat Risiko</option>
              <option value="HIGH">Tinggi (&gt;70%)</option>
              <option value="MEDIUM">Sedang (40-70%)</option>
              <option value="LOW">Rendah (&lt;40%)</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            >
              <option value="prob_desc">Probabilitas (Tertinggi)</option>
              <option value="prob_asc">Probabilitas (Terendah)</option>
              <option value="income_desc">Gaji Bulanan (Tertinggi)</option>
              <option value="tenure_desc">Masa Kerja (Tenure)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cohort Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Karyawan</th>
                <th className="px-4 py-3.5">Departemen / Peran</th>
                <th className="px-4 py-3.5">Gaji Bulanan</th>
                <th className="px-4 py-3.5">Lembur</th>
                <th className="px-4 py-3.5">Status CSV (Asli)</th>
                <th className="px-4 py-3.5">Prediksi Model ML</th>
                <th className="px-4 py-3.5">Faktor Pendorong (SHAP)</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-xs">
                    Tidak ada data karyawan yang sesuai dengan kriteria pencarian.
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
                      className="hover:bg-slate-850/60 transition-colors group"
                    >
                      {/* Employee Ref & Name */}
                      <td className="px-5 py-3">
                        <div className="font-semibold text-slate-100">{item.profile.fullName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{item.profile.employeeRef}</div>
                      </td>

                      {/* Dept & Role */}
                      <td className="px-4 py-3">
                        <div className="text-slate-300 font-medium">{item.profile.jobRole}</div>
                        <div className="text-[11px] text-slate-400">{item.profile.department}</div>
                      </td>

                      {/* Monthly Income */}
                      <td className="px-4 py-3 font-mono text-slate-200 tabular-nums">
                        ${item.profile.monthlyIncome.toLocaleString()}
                      </td>

                      {/* Overtime */}
                      <td className="px-4 py-3">
                        <span
                          className={`font-mono text-[11px] font-semibold ${
                            item.profile.overTime === 'Yes' ? 'text-rose-400' : 'text-slate-400'
                          }`}
                        >
                          {item.profile.overTime}
                        </span>
                      </td>

                      {/* Ground Truth Status from CSV */}
                      <td className="px-4 py-3">
                        {isActualDeparted ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            <AlertOctagon className="w-3 h-3 text-rose-400" />
                            <span>Keluar (Yes)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Aktif (No)</span>
                          </span>
                        )}
                      </td>

                      {/* Probability & Badge */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold text-sm tabular-nums ${
                              isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {probPct}%
                          </span>
                          <span
                            className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                              isHigh
                                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                : isMed
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {item.prediction.riskLevel}
                          </span>
                        </div>
                      </td>

                      {/* Top Driver */}
                      <td className="px-4 py-3 max-w-[220px]">
                        {topDriver ? (
                          <div
                            className="text-[11px] truncate text-slate-300"
                            title={topDriver.description}
                          >
                            <span
                              className={`font-semibold mr-1 ${
                                topDriver.direction === 'increases' ? 'text-rose-400' : 'text-emerald-400'
                              }`}
                            >
                              {topDriver.direction === 'increases' ? '▲' : '▼'} {topDriver.feature}:
                            </span>
                            <span className="text-slate-400">{topDriver.featureValue}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectedEmployee(item)}
                            title="Buka Waterfall SHAP"
                            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleCreateAlert(item)}
                            title="Kirim ke Peringatan Dini"
                            className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-slate-800 rounded transition-colors"
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
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Menampilkan{' '}
              <span className="font-semibold text-slate-200">
                {filteredList.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </span>{' '}
              -{' '}
              <span className="font-semibold text-slate-200">
                {Math.min(currentPage * pageSize, filteredList.length)}
              </span>{' '}
              dari <span className="font-semibold text-slate-200">{filteredList.length.toLocaleString()}</span> data
            </span>

            <span className="text-slate-600">|</span>

            <span className="flex items-center gap-1.5">
              <span>Per Halaman:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
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
              className="px-2.5 py-1 text-xs rounded border border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <span className="font-mono text-xs text-slate-300 px-2">
              Halaman {currentPage} dari {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 text-xs rounded border border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SHAP Inspection Drawer / Modal */}
      {inspectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <span>Penjelasan SHAP: {inspectedEmployee.profile.fullName}</span>
                  <span className="font-mono text-xs text-slate-400">({inspectedEmployee.profile.employeeRef})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {inspectedEmployee.profile.jobRole} · {inspectedEmployee.profile.department} · Status CSV:{' '}
                  <span className={inspectedEmployee.profile.actualAttrition === 'Yes' ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                    {inspectedEmployee.profile.actualAttrition === 'Yes' ? 'Keluar' : 'Aktif'}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setInspectedEmployee(null)}
                className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Risk Summary Badge */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Tingkat Risiko Model</div>
                  <div
                    className={`text-xl font-bold font-mono mt-0.5 ${
                      inspectedEmployee.prediction.riskLevel === 'HIGH'
                        ? 'text-rose-400'
                        : inspectedEmployee.prediction.riskLevel === 'MEDIUM'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {(inspectedEmployee.prediction.attritionProbability * 100).toFixed(1)}% (
                    {inspectedEmployee.prediction.riskLevel})
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Prior Tolok Ukur E[f(x)]</div>
                  <div className="text-base font-mono font-semibold text-slate-300">16,1%</div>
                </div>
              </div>

              {/* Waterfall Chart */}
              <div>
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
                  Grafik Waterfall SHAP Lokal
                </h4>
                <ShapWaterfall
                  factors={inspectedEmployee.prediction.topRiskFactors}
                  baseValue={inspectedEmployee.prediction.baseValue}
                  finalProbability={inspectedEmployee.prediction.attritionProbability}
                />
              </div>

              {/* Prescribed Interventions */}
              <div>
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
                  Tindakan Retensi yang Direkomendasikan
                </h4>
                <div className="space-y-2">
                  {inspectedEmployee.prediction.suggestedInterventions.map((act, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <button
                onClick={() => {
                  handleCreateAlert(inspectedEmployee);
                  setInspectedEmployee(null);
                }}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Buat Peringatan Triggers</span>
              </button>

              <button
                onClick={() => setInspectedEmployee(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
