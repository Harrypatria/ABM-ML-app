import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { PredictorView } from './components/PredictorView';
import { BatchView } from './components/BatchView';
import { AlertsView } from './components/AlertsView';
import { TasksView } from './components/TasksView';
import { ModelView } from './components/ModelView';
import { SettingsView } from './components/SettingsView';
import { getAlerts, getTasks, StorageEvent, initDatasetFromAttachedCsv } from './lib/storage';
import { getPreferredLanguage, setPreferredLanguage, Language } from './lib/i18n';
import { isAuthenticated } from './lib/auth';

export default function App() {
  const [isAuthed, setIsAuthed] = useState<boolean>(isAuthenticated());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [openAlertCount, setOpenAlertCount] = useState(0);
  const [todoTaskCount, setTodoTaskCount] = useState(0);
  const [language, setLanguage] = useState<Language>(getPreferredLanguage());

  // Listen to auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthed(isAuthenticated());
    };
    window.addEventListener('app_auth_changed', handleAuthChange);
    return () => window.removeEventListener('app_auth_changed', handleAuthChange);
  }, []);

  // Auto-initialize 1,470 employee cohort from attached CSV on initial load
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

  // If user is unauthenticated, render the responsive landing page
  if (!isAuthed) {
    return <LandingPage onSuccessAuth={() => setIsAuthed(true)} />;
  }

  // When authenticated, render the primary retention command center
  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        openCount={openAlertCount}
        taskTodoCount={todoTaskCount}
        currentLanguage={language}
        onToggleLanguage={handleToggleLanguage}
        onSignOut={() => setIsAuthed(false)}
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

      {/* Editorial Footer */}
      <footer className="border-t border-border bg-card py-6 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Attrition Predictor Pro</span>
            <span aria-hidden="true">·</span>
            <span>ITDO framework (Insights → Triggers → Decisions → Operations)</span>
          </div>

          <div className="flex items-center gap-3 text-muted-foreground font-mono text-[11px]">
            <span>GradientBoosting v1.0.0</span>
            <span aria-hidden="true">·</span>
            <span>SHAP TreeExplainer</span>
            <span aria-hidden="true">·</span>
            <span>Holdout AUC: 0.8742</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
