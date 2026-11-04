/**
 * Internationalization (i18n) dictionary for English and Bahasa Indonesia
 * Supports bilingual executive and people analytics terminology.
 */

export type Language = 'en' | 'id';

export const TRANSLATIONS = {
  en: {
    appTitle: 'Attrition Predictor Pro',
    subtitle: 'Proactive Retention Intelligence & ITDO Framework',
    datasetStatus: 'Attached Dataset (1,470 Employees) Active',
    reloadDataset: 'Reload Attached CSV',
    dashboard: 'Dashboard',
    predictor: 'Predictor',
    batchUpload: 'Batch Explorer',
    alerts: 'Alerts',
    tasks: 'Action Board',
    model: 'Model Metrics',
    settings: 'Settings',
    quickPredict: 'Quick Predict',
    totalHeadcount: 'Total Tracked Cohort',
    highRiskAlerts: 'High Risk (Critical Triggers)',
    avgFlightProbability: 'Mean Attrition Probability',
    costExposure: 'Financial Cost Exposure',
    groundTruthAttrition: 'Actual Historical Departures',
    benchmarkPrior: 'Benchmark Prior E[f(x)]',
    overtimeDriver: 'Overtime Workload Impact',
    incomeDisparity: 'Compensation Band Gap',
    actionPlan: 'Retention Interventions',
    searchPlaceholder: 'Search by name, role, or ID...',
    allDepartments: 'All Departments',
    allRiskLevels: 'All Risk Levels',
    exportCsv: 'Export Scored CSV',
    viewShap: 'Explain SHAP',
    triggerAlert: 'Create Alert',
    createTask: 'Assign Task',
    selectFromDataset: 'Select Employee from 1,470 Cohort',
    resetPreset: 'Reset Baseline',
    counterfactual: 'Simulate "What-If" Counterfactual',
  },
  id: {
    appTitle: 'Attrition Predictor Pro',
    subtitle: 'Sistem Intelijen Retensi Karyawan & Framework ITDO',
    datasetStatus: 'Dataset Lampiran (1.470 Karyawan) Aktif',
    reloadDataset: 'Muat Ulang CSV Lampiran',
    dashboard: 'Dasbor Eksekutif',
    predictor: 'Prediktor Risiko',
    batchUpload: 'Eksplorasi Data (Batch)',
    alerts: 'Peringatan Dini',
    tasks: 'Papan Tindakan',
    model: 'Metrik & Validasi Model',
    settings: 'Pengaturan',
    quickPredict: 'Simulasi Prediksi',
    totalHeadcount: 'Total Kohort Terdata',
    highRiskAlerts: 'Risiko Tinggi (>70% Trigger)',
    avgFlightProbability: 'Rata-rata Probabilitas Attrisi',
    costExposure: 'Estimasi Risiko Biaya Pergantian',
    groundTruthAttrition: 'Karyawan Keluar (Ground Truth CSV)',
    benchmarkPrior: 'Prior Dasar Tolok Ukur E[f(x)]',
    overtimeDriver: 'Dampak Beban Lembur (OverTime)',
    incomeDisparity: 'Kesenjangan Kompensasi',
    actionPlan: 'Rencana Tindakan Retensi',
    searchPlaceholder: 'Cari berdasarkan nama, peran, atau ID...',
    allDepartments: 'Semua Departemen',
    allRiskLevels: 'Semua Tingkat Risiko',
    exportCsv: 'Ekspor Hasil Skor CSV',
    viewShap: 'Analisis SHAP',
    triggerAlert: 'Buat Peringatan',
    createTask: 'Tugaskan Tindakan',
    selectFromDataset: 'Pilih Karyawan dari 1.470 Data Lampiran',
    resetPreset: 'Reset Standar',
    counterfactual: 'Simulasi Perubahan "What-If"',
  },
};

const LANG_KEY = 'app_preferred_language';

export function getPreferredLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'id') return saved;
    // Default to id if user agent or prompt is Indonesian, else en
    return 'id';
  } catch {
    return 'id';
  }
}

export function setPreferredLanguage(lang: Language): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
    window.dispatchEvent(new Event('app_language_changed'));
  } catch {
    // ignore
  }
}
