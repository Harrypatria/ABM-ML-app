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
  Database,
  RefreshCw,
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
    setSavedFeedback('Settings saved successfully.');
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  const handleReloadAttachedCsv = async () => {
    setIsReloading(true);
    try {
      const data = await initDatasetFromAttachedCsv(true);
      setSavedFeedback(`Successfully reloaded ${data.length.toLocaleString()} employee records from attached dataset.`);
      setTimeout(() => setSavedFeedback(null), 3500);
    } catch {
      setSavedFeedback('Unable to load attached CSV. Please check the file path.');
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
      setSavedFeedback('All data has been reset to defaults.');
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
    a.download = `Retention_Predictor_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">
            System Settings & Parameters
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure risk trigger thresholds, financial replacement multipliers, and HR team assignments.
          </p>
        </div>

        {savedFeedback && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{savedFeedback}</span>
          </div>
        )}
      </div>

      {/* Section 00: Attached Dataset Status & Sync */}
      <div className="bg-white border border-cyan-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Benchmark Dataset (Attached Data Foundation)</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              File: <code className="font-mono text-cyan-800 font-semibold">HR-Employee-Attrition.csv</code> (1,470 records active)
            </p>
          </div>

          <button
            type="button"
            onClick={handleReloadAttachedCsv}
            disabled={isReloading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
            <span>{isReloading ? 'Reloading...' : 'Reload 1,470 Records'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          All employee profiles, historical departure labels, workload metrics, and salary bands are continuously synchronized with your attached benchmark dataset.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Risk Threshold & Exposure Multipliers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            01. Flight Risk Thresholds
          </h3>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-700 font-semibold">Critical Alert Trigger Probability</span>
              <span className="font-mono text-cyan-800 font-bold tabular-nums">
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
              className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Employees with predicted departure probability at or above this threshold trigger escalations in the Alerts queue. Recommended standard: 70%.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-700 font-semibold">Voluntary Departure Cost Multiplier</span>
              <span className="font-mono text-amber-700 font-bold tabular-nums">
                {settings.costMultiplier.toFixed(2)}x Annual Base Salary
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
              className="w-full accent-amber-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Industry standard multiplier reflecting recruitment fees, onboarding ramp-up, and lost operational productivity per departure.
            </p>
          </div>
        </div>

        {/* HR Business Partners */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            02. HR Business Partner Routing Directory
          </h3>

          <div className="space-y-2">
            {settings.hrPartners.map((partner, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <span className="text-slate-800 font-medium">{partner}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePartner(index)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="e.g. Jordan Smith (Lead HRBP, Engineering)"
              value={newPartnerName}
              onChange={(e) => setNewPartnerName(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
            />
            <button
              type="button"
              onClick={handleAddPartner}
              className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl whitespace-nowrap cursor-pointer transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetData}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Benchmark Data</span>
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Backup</span>
            </button>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
