import React, { useState } from 'react';
import {
  Save,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  BellRing,
  UserPlus,
  Trash2,
  Download,
} from 'lucide-react';
import {
  getSettings,
  saveSettings,
  resetAllDataToDefault,
  getEmployees,
  getAlerts,
  getTasks,
  initDatasetFromAttachedCsv,
} from '../lib/storage';
import { AppSettings } from '../types';

export const SettingsView: React.FC = () => {
  const [settings, setSettingsState] = useState<AppSettings>(getSettings());
  const [newPartnerName, setNewPartnerName] = useState('');
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);
  const [isReloading, setIsReloading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    setSavedFeedback('Pengaturan berhasil disimpan!');
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  const handleReloadAttachedCsv = async () => {
    setIsReloading(true);
    try {
      const data = await initDatasetFromAttachedCsv(true);
      setSavedFeedback(`Berhasil memuat ulang ${data.length} data karyawan dari file lampiran CSV!`);
      setTimeout(() => setSavedFeedback(null), 3500);
    } catch {
      setSavedFeedback('Gagal memuat file lampiran.');
      setTimeout(() => setSavedFeedback(null), 3500);
    } finally {
      setIsReloading(false);
    }
  };

  const handleAddPartner = () => {
    if (!newPartnerName.trim()) return;
    setSettingsState((prev) => ({
      ...prev,
      hrPartners: [...prev.hrPartners, newPartnerName.trim()],
    }));
    setNewPartnerName('');
  };

  const handleRemovePartner = (index: number) => {
    setSettingsState((prev) => ({
      ...prev,
      hrPartners: prev.hrPartners.filter((_, i) => i !== index),
    }));
  };

  const handleResetData = () => {
    if (window.confirm('Reset all employee records, alerts, and tasks to original IBM HR benchmark defaults?')) {
      resetAllDataToDefault();
      setSettingsState(getSettings());
      setSavedFeedback('Data berhasil di-reset.');
      setTimeout(() => setSavedFeedback(null), 3000);
    }
  };

  const handleExportJSON = () => {
    const backup = {
      settings: getSettings(),
      employees: getEmployees(),
      alerts: getAlerts(),
      tasks: getTasks(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attrition_Predictor_Pro_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-100">
            System Settings & Decision Thresholds
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure risk trigger cutoffs, financial cost multipliers, and HR team assignments
          </p>
        </div>

        {savedFeedback && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{savedFeedback}</span>
          </div>
        )}
      </div>

      {/* Section 00: Attached Dataset Status & Sync */}
      <div className="bg-slate-900/60 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Dataset Lampiran (Basis Aplikasi)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              File: <code className="font-mono text-cyan-300">/assets/aistudio/HR-Employee-Attrition__2__a5c31e38.csv</code> (1.470 data karyawan)
            </p>
          </div>

          <button
            type="button"
            onClick={handleReloadAttachedCsv}
            disabled={isReloading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
          >
            <span>{isReloading ? 'Memuat...' : 'Muat Ulang 1.470 Data'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Seluruh profil karyawan, status ground-truth (keluar vs aktif), tingkat lembur, dan kompensasi terhubung langsung dengan file lampiran yang Anda sediakan.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Risk Threshold & Exposure Multipliers */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
            01. Flight Risk Alert Threshold
          </h3>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Critical Alert Trigger Probability</span>
              <span className="font-mono text-cyan-400 font-bold tabular-nums">
                {(settings.alertThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.85"
              step="0.05"
              value={settings.alertThreshold}
              onChange={(e) =>
                setSettingsState((prev) => ({
                  ...prev,
                  alertThreshold: Number(e.target.value),
                }))
              }
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Employees scoring above this predicted probability automatically trigger notifications on the Alerts board. Standard: 70%.
            </p>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Voluntary Departure Replacement Cost Multiplier</span>
              <span className="font-mono text-amber-300 font-bold tabular-nums">
                {settings.costMultiplier.toFixed(2)}x Annual Salary
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.05"
              value={settings.costMultiplier}
              onChange={(e) =>
                setSettingsState((prev) => ({
                  ...prev,
                  costMultiplier: Number(e.target.value),
                }))
              }
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Used in CPO Executive Board metrics to calculate organizational financial exposure (recruitment, onboarding, ramp-up loss).
            </p>
          </div>
        </div>

        {/* HR Business Partners */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
            02. HR Business Partner Routing Directory
          </h3>

          <div className="space-y-2">
            {settings.hrPartners.map((partner, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs"
              >
                <span className="text-slate-200 font-medium">{partner}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePartner(index)}
                  className="text-slate-400 hover:text-rose-400 p-1 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="e.g. Jordan Smith (Lead HRBP, Product)"
              value={newPartnerName}
              onChange={(e) => setNewPartnerName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={handleAddPartner}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetData}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/10 border border-rose-500/30 rounded-lg transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Benchmark Data</span>
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Full JSON</span>
            </button>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-cyan-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
