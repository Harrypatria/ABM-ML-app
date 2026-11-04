import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Language } from '../lib/i18n';

export type NavTab = 'dashboard' | 'predict' | 'batch' | 'alerts' | 'tasks' | 'model' | 'settings';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  openCount: number;
  taskTodoCount: number;
  currentLanguage?: Language;
  onToggleLanguage?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  openCount,
  taskTodoCount,
  currentLanguage = 'id',
  onToggleLanguage,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="text-left group transition-opacity hover:opacity-90 whitespace-nowrap shrink-0"
        >
          <span className="font-display text-xl font-bold tracking-tight text-slate-100">
            Attrition Predictor <span className="text-cyan-400">Pro</span>
          </span>
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'dashboard'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => onSelectTab('predict')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'predict'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Predictor
          </button>

          <button
            onClick={() => onSelectTab('batch')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'batch'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Batch Upload
          </button>

          <button
            onClick={() => onSelectTab('alerts')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'alerts'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Alerts</span>
            {openCount > 0 && (
              <span className="text-[11px] font-mono font-semibold px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded border border-rose-500/40 tabular-nums">
                {openCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('tasks')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Task Board</span>
            {taskTodoCount > 0 && (
              <span className="text-[11px] font-mono font-semibold px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700 tabular-nums">
                {taskTodoCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('model')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'model'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Model Insights
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'settings'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Zone 3: Dataset badge, language toggle & primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-slate-900/90 rounded border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>1,470 Records Active</span>
          </div>

          {onToggleLanguage && currentLanguage && (
            <button
              onClick={onToggleLanguage}
              title="Ganti Bahasa / Switch Language"
              className="px-2.5 py-1 text-xs font-mono font-semibold rounded border border-slate-700 bg-slate-900 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
            >
              {currentLanguage.toUpperCase()}
            </button>
          )}

          <button
            onClick={() => onSelectTab('predict')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{currentLanguage === 'id' ? 'Simulasi Risiko' : 'New Prediction'}</span>
          </button>
        </div>
      </div>

      {/* Mobile subnav */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-800/80 gap-3 text-xs">
        {(['dashboard', 'predict', 'batch', 'alerts', 'tasks', 'model', 'settings'] as NavTab[]).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => onSelectTab(tab)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-md font-medium capitalize ${
                activeTab === tab ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'text-slate-400'
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
