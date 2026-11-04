import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { PredictorView } from './components/PredictorView';
import { BatchView } from './components/BatchView';
import { AlertsView } from './components/AlertsView';
import { TasksView } from './components/TasksView';
import { ModelView } from './components/ModelView';
import { SettingsView } from './components/SettingsView';
import { getAlerts, getTasks, StorageEvent, initDatasetFromAttachedCsv } from './lib/storage';
import { getPreferredLanguage, setPreferredLanguage, Language } from './lib/i18n';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [openAlertCount, setOpenAlertCount] = useState(0);
  const [todoTaskCount, setTodoTaskCount] = useState(0);
  const [language, setLanguage] = useState<Language>(getPreferredLanguage());

  // Auto-initialize full 1,470 employee cohort from the attached CSV on initial load
  useEffect(() => {
    initDatasetFromAttachedCsv(false).then(() => {
      syncCounts();
    });
  }, []);

  // Sync counts and listen to storage updates
  const syncCounts = () => {
    const alerts = getAlerts();
    const tasks = getTasks();
    setOpenAlertCount(alerts.filter((a) => a.status === 'OPEN').length);
    setTodoTaskCount(tasks.filter((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS').length);
  };

  useEffect(() => {
    syncCounts();
    window.addEventListener(StorageEvent, syncCounts);
    return () => window.removeEventListener(StorageEvent, syncCounts);
  }, []);

  const handleToggleLanguage = () => {
    const nextLang: Language = language === 'id' ? 'en' : 'id';
    setLanguage(nextLang);
    setPreferredLanguage(nextLang);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Bar Contract (Wordmark, Nav Links, Primary Action) */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        openCount={openAlertCount}
        taskTodoCount={todoTaskCount}
        currentLanguage={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={setActiveTab}
            onOpenNewPrediction={() => setActiveTab('predict')}
          />
        )}
        {activeTab === 'predict' && <PredictorView />}
        {activeTab === 'batch' && <BatchView />}
        {activeTab === 'alerts' && <AlertsView />}
        {activeTab === 'tasks' && <TasksView />}
        {activeTab === 'model' && <ModelView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Clean Editorial Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Attrition Predictor Pro</span>
            <span aria-hidden="true">·</span>
            <span>ITDO Framework (Insights → Triggers → Decisions → Operations)</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>Model: GradientBoosting v1.0.0</span>
            <span aria-hidden="true">·</span>
            <span>SHAP TreeExplainer Enabled</span>
            <span aria-hidden="true">·</span>
            <span>Holdout AUC: 0.8742</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
