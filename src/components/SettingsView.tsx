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
  AlertTriangle,
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
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

  const executeReset = () => {
    resetAllDataToDefault();
    setSettingsState(getSettings());
    setShowResetConfirm(false);
    setSavedFeedback('All data has been reset to defaults.');
    setTimeout(() => setSavedFeedback(null), 3000);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            System settings
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Configure risk trigger thresholds, financial replacement multipliers, and HR team assignments.
          </p>
        </div>

        {savedFeedback && (
          <div
            role="status"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent border border-border text-accent-foreground text-xs font-semibold animate-fadeIn"
          >
            <CheckCircle2 className="w-4 h-4 text-primary" aria-hidden="true" />
            <span>{savedFeedback}</span>
          </div>
        )}
      </div>

      {/* Section 00: Attached Dataset Status & Sync */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" aria-hidden="true" />
              <span>Benchmark dataset</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              File: <code className="font-mono text-foreground font-semibold">HR-Employee-Attrition.csv</code> (1,470 records active)
            </p>
          </div>

          <button
            type="button"
            onClick={handleReloadAttachedCsv}
            disabled={isReloading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-accent text-accent-foreground border border-border hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{isReloading ? 'Reloading...' : 'Reload 1,470 records'}</span>
          </button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Employee profiles, historical departure labels, workload metrics, and salary bands are synchronized with the attached benchmark dataset.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Risk Threshold & Exposure Multipliers */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            01. Flight risk thresholds
          </h3>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="setting-alert-threshold" className="text-foreground font-semibold">Critical alert trigger probability</label>
              <span className="font-mono text-foreground font-bold tabular-nums">
                {(settings.alertThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <input
              id="setting-alert-threshold"
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
              className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Employees with predicted departure probability at or above this threshold trigger escalations in the alerts queue. Standard baseline: 70%.
            </p>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="setting-cost-multiplier" className="text-foreground font-semibold">Voluntary departure cost multiplier</label>
              <span className="font-mono text-foreground font-bold tabular-nums">
                {settings.costMultiplier.toFixed(2)}x annual salary
              </span>
            </div>
            <input
              id="setting-cost-multiplier"
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
              className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Reflects recruitment search fees, onboarding ramp-up, and lost team productivity per departure.
            </p>
          </div>
        </div>

        {/* HR Business Partners */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            02. HR partner routing directory
          </h3>

          <div className="space-y-2">
            {settings.hrPartners.map((partner, index) => (
              <div
                key={partner}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border text-xs"
              >
                <span className="text-foreground font-medium">{partner}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePartner(index)}
                  aria-label={`Remove ${partner}`}
                  className="text-muted-foreground hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive focus-visible:outline-hidden p-1 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <label htmlFor="new-partner-input" className="sr-only">New partner name</label>
            <input
              id="new-partner-input"
              type="text"
              placeholder="e.g. Jordan Smith (Lead HRBP, Engineering)"
              value={newPartnerName}
              onChange={(e) => setNewPartnerName(e.target.value)}
              className="flex-1 bg-card border border-input rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary focus-visible:outline-hidden"
            />
            <button
              type="button"
              onClick={handleAddPartner}
              className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-foreground bg-muted hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden rounded-xl whitespace-nowrap cursor-pointer transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add member</span>
            </button>
          </div>
        </div>

        {/* Inline Reset Confirmation (replaces banned window.confirm) */}
        {showResetConfirm && (
          <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 space-y-3" role="alert">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h4 className="text-xs font-bold text-destructive">Confirm data reset</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reset all records, alerts, and tasks to the original IBM HR benchmark defaults? Custom modifications will be replaced.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeReset}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:outline-hidden"
              >
                Yes, reset data
              </button>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/20 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:outline-hidden rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset benchmark data</span>
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-card hover:bg-muted border border-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Export JSON backup</span>
            </button>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden rounded-xl transition-colors whitespace-nowrap shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            <span>Save settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
