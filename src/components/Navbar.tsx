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
  currentLanguage = 'en',
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
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="text-left transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden rounded-lg whitespace-nowrap shrink-0 flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
            A
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            Attrition Predictor <span className="text-primary">Pro</span>
          </span>
        </button>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold" aria-label="Main navigation">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden rounded cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {currentLanguage === 'id' ? 'Dasbor' : 'Dashboard'}
          </button>

          <button
            onClick={() => onSelectTab('predict')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden rounded cursor-pointer ${
              activeTab === 'predict'
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {currentLanguage === 'id' ? 'Prediktor' : 'Predictor'}
          </button>

          <button
            onClick={() => onSelectTab('batch')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden rounded cursor-pointer ${
              activeTab === 'batch'
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {currentLanguage === 'id' ? 'Eksplorasi data' : 'Cohort explorer'}
          </button>

          <button
            onClick={() => onSelectTab('alerts')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden rounded cursor-pointer ${
              activeTab === 'alerts'
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{currentLanguage === 'id' ? 'Peringatan' : 'Risk alerts'}</span>
            {openCount > 0 && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-destructive/10 text-destructive rounded border border-destructive/20 tabular-nums">
                {openCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('tasks')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden rounded cursor-pointer ${
              activeTab === 'tasks'
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{currentLanguage === 'id' ? 'Tindakan' : 'Retention tasks'}</span>
            {taskTodoCount > 0 && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-muted text-muted-foreground rounded border border-border tabular-nums">
                {taskTodoCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('model')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden rounded cursor-pointer ${
              activeTab === 'model'
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {currentLanguage === 'id' ? 'Metrik model' : 'Model metrics'}
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden rounded cursor-pointer ${
              activeTab === 'settings'
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {currentLanguage === 'id' ? 'Pengaturan' : 'Settings'}
          </button>
        </nav>

        {/* Zone 3: Dataset badge, language toggle, primary action & sign out */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-lg border border-border text-[11px] font-mono text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
            <span>1,470 records active</span>
          </div>

          {onToggleLanguage && currentLanguage && (
            <button
              onClick={onToggleLanguage}
              title="Switch language"
              aria-label="Switch language"
              className="px-2 py-1 text-xs font-mono font-semibold rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden transition-colors cursor-pointer"
            >
              {currentLanguage.toUpperCase()}
            </button>
          )}

          <button
            onClick={() => onSelectTab('predict')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden rounded-lg transition-all whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{currentLanguage === 'id' ? 'Simulasi risiko' : 'Simulate scenario'}</span>
          </button>

          {/* User session & Sign out */}
          <div className="flex items-center pl-2 border-l border-border gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono font-medium text-muted-foreground">
              <User className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
              <span>masterclass</span>
            </div>
            <button
              onClick={handleSignOutClick}
              title="Sign out of workspace"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg border border-border hover:border-destructive/20 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:outline-hidden transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 border-t border-border gap-2 text-xs bg-muted/40">
        {(['dashboard', 'predict', 'batch', 'alerts', 'tasks', 'model', 'settings'] as NavTab[]).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => onSelectTab(tab)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium capitalize cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden ${
                activeTab === tab ? 'bg-accent text-accent-foreground font-bold' : 'text-muted-foreground'
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
