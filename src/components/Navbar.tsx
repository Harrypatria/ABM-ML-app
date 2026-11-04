import React from 'react';
import { PlusCircle, LogOut, User, Database } from 'lucide-react';
import { Language } from '../lib/i18n';
import { signOut } from '../lib/auth';

export type NavTab = 'dashboard' | 'predict' | 'batch' | 'alerts' | 'tasks' | 'model' | 'settings';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  openCount: number;
  taskTodoCount: number;
  currentLanguage?: Language;
  onToggleLanguage?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  openCount,
  taskTodoCount,
  currentLanguage = 'id',
  onToggleLanguage,
  onSignOut,
}) => {
  const handleSignOutClick = () => {
    signOut();
    if (onSignOut) {
      onSignOut();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="text-left group transition-opacity hover:opacity-90 whitespace-nowrap shrink-0 flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            A
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">
            Attrition Predictor <span className="text-cyan-600">Pro</span>
          </span>
        </button>

        {/* Zone 2: Concise single-line navigation links adhering to UX principles */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-cyan-700 border-b-2 border-cyan-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {currentLanguage === 'id' ? 'Dasbor' : 'Dashboard'}
          </button>

          <button
            onClick={() => onSelectTab('predict')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'predict'
                ? 'text-cyan-700 border-b-2 border-cyan-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {currentLanguage === 'id' ? 'Prediktor' : 'Predictor'}
          </button>

          <button
            onClick={() => onSelectTab('batch')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'batch'
                ? 'text-cyan-700 border-b-2 border-cyan-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {currentLanguage === 'id' ? 'Eksplorasi Data' : 'Cohort Explorer'}
          </button>

          <button
            onClick={() => onSelectTab('alerts')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'alerts'
                ? 'text-cyan-700 border-b-2 border-cyan-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{currentLanguage === 'id' ? 'Peringatan' : 'Risk Alerts'}</span>
            {openCount > 0 && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded border border-rose-200 tabular-nums">
                {openCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('tasks')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tasks'
                ? 'text-cyan-700 border-b-2 border-cyan-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{currentLanguage === 'id' ? 'Tindakan Retensi' : 'Retention Tasks'}</span>
            {taskTodoCount > 0 && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded border border-slate-200 tabular-nums">
                {taskTodoCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('model')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'model'
                ? 'text-cyan-700 border-b-2 border-cyan-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {currentLanguage === 'id' ? 'Metrik Model' : 'Model Metrics'}
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'settings'
                ? 'text-cyan-700 border-b-2 border-cyan-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {currentLanguage === 'id' ? 'Pengaturan' : 'Settings'}
          </button>
        </nav>

        {/* Zone 3: Dataset badge, language toggle, primary action & sign out */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>1,470 Records Ingested</span>
          </div>

          {onToggleLanguage && currentLanguage && (
            <button
              onClick={onToggleLanguage}
              title="Ganti Bahasa / Switch Language"
              className="px-2 py-1 text-xs font-mono font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:text-cyan-700 hover:border-cyan-300 transition-colors cursor-pointer"
            >
              {currentLanguage.toUpperCase()}
            </button>
          )}

          <button
            onClick={() => onSelectTab('predict')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{currentLanguage === 'id' ? 'Simulasi Risiko' : 'Simulate Flight'}</span>
          </button>

          {/* User session & Sign Out */}
          <div className="flex items-center pl-2 border-l border-slate-200 gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono font-medium text-slate-600">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>masterclass</span>
            </div>
            <button
              onClick={handleSignOutClick}
              title="Sign Out of Session"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile subnav */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-200 gap-2 text-xs bg-slate-50">
        {(['dashboard', 'predict', 'batch', 'alerts', 'tasks', 'model', 'settings'] as NavTab[]).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => onSelectTab(tab)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium capitalize cursor-pointer ${
                activeTab === tab ? 'bg-cyan-100 text-cyan-800 font-bold' : 'text-slate-600'
              }`}
            >
              {tab === 'predict' ? 'Predictor' : tab === 'tasks' ? 'Tasks' : tab}
            </button>
          )
        )}
      </div>
    </header>
  );
};
