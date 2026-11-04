import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Database,
  BarChart3,
  Layers,
  Sliders,
} from 'lucide-react';
import { authenticate } from '../lib/auth';

interface LandingPageProps {
  onSuccessAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSuccessAuth }) => {
  const [username, setUsername] = useState('masterclass');
  const [password, setPassword] = useState('agentic26');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = authenticate(username, password);
      setIsLoading(false);
      if (result.success) {
        onSuccessAuth();
      } else {
        setErrorMsg(result.errorMessage || 'Unable to sign in. Please verify your credentials.');
      }
    }, 200);
  };

  const handleFillDemo = () => {
    setUsername('masterclass');
    setPassword('agentic26');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col font-sans">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-xs">
              A
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-foreground">
                Attrition Predictor <span className="text-primary">Pro</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded-full bg-accent text-accent-foreground border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
              1,470 benchmark records active
            </span>
            <a
              href="#signin-section"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-foreground text-background hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden transition-colors"
            >
              Sign in
            </a>
          </div>
        </div>
      </header>

      {/* Main Hero & Auth Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent border border-border text-accent-foreground text-xs font-medium">
                <Sliders className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span>Enterprise retention intelligence and ITDO operations</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground leading-[1.12]">
                Predict voluntary departures <span className="text-primary">before</span> exit interviews occur.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                Identify flight probability across 35 workforce attributes, inspect local SHAP root causes, and schedule targeted retention tasks.
              </p>

              {/* Metric Highlights Strip */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border max-w-xl">
                <div>
                  <div className="text-2xl font-bold font-mono text-foreground tabular-nums">0.874</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Holdout AUC-ROC score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-primary tabular-nums">1,470</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Active cohort records</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-foreground tabular-nums">1.75x</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Annual replacement factor</div>
                </div>
              </div>

              {/* Feature Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-card border border-border text-foreground shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  SHAP waterfall interpretability
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-card border border-border text-foreground shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  Insights to operations workflow
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-card border border-border text-foreground shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  Calibrated departure probabilities
                </span>
              </div>
            </div>

            {/* Right Column: Minimalist Modern Auth Card */}
            <div id="signin-section" className="lg:col-span-5">
              <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm relative">
                {/* Demo Credentials Helper Box */}
                <div className="mb-6 p-3 rounded-xl bg-accent border border-border flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-accent-foreground block">Demo credentials:</span>
                    <span className="font-mono text-muted-foreground text-[11px]">
                      Username: <strong className="text-foreground">masterclass</strong> · Password: <strong className="text-foreground">agentic26</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-card text-accent-foreground border border-border hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden transition-colors whitespace-nowrap"
                  >
                    Auto-fill
                  </button>
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">
                    Sign in
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your workspace credentials to access the retention command center.
                  </p>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="leading-relaxed">{errorMsg}</span>
                  </div>
                )}

                {/* Sign in Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="auth-username"
                      className="block text-xs font-semibold text-foreground mb-1.5"
                    >
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground" aria-hidden="true">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="auth-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. masterclass"
                        autoComplete="username"
                        required
                        className="w-full pl-9 pr-3 py-2.5 text-xs font-mono bg-card border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary focus-visible:outline-hidden transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="auth-password"
                      className="block text-xs font-semibold text-foreground mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground" aria-hidden="true">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="e.g. agentic26"
                        autoComplete="current-password"
                        required
                        className="w-full pl-9 pr-10 py-2.5 text-xs font-mono bg-card border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary focus-visible:outline-hidden transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
                    >
                      {isLoading ? (
                        <span>Signing in...</span>
                      ) : (
                        <>
                          <span>Sign in</span>
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Protected system</span>
                  <span>ITDO framework v1.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Stage ITDO Architecture Section */}
        <div className="border-t border-border bg-card py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                The ITDO retention framework
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Turn predictive signals into concrete, trackable people operations across four stages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Step 1: Insights */}
              <div className="p-6 rounded-2xl bg-muted/40 border border-border">
                <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center font-bold text-xs font-mono mb-4">
                  01
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1.5">Insights (Model)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Evaluates flight probability using calibrated Gradient Boosting trees across all 1,470 employees.
                </p>
              </div>

              {/* Step 2: Triggers */}
              <div className="p-6 rounded-2xl bg-muted/40 border border-border">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center font-bold text-xs font-mono mb-4">
                  02
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1.5">Triggers (Alerts)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Automatic escalations trigger when predicted departure probability crosses the 70% threshold.
                </p>
              </div>

              {/* Step 3: Decisions */}
              <div className="p-6 rounded-2xl bg-muted/40 border border-border">
                <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center font-bold text-xs font-mono mb-4">
                  03
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1.5">Decisions (SHAP)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  SHAP waterfalls isolate primary drivers including overtime and salary gaps for targeted resolution.
                </p>
              </div>

              {/* Step 4: Operations */}
              <div className="p-6 rounded-2xl bg-muted/40 border border-border">
                <div className="w-8 h-8 rounded-lg bg-muted text-foreground flex items-center justify-center font-bold text-xs font-mono mb-4">
                  04
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1.5">Operations (Tasks)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Assign stay interviews, compensation adjustments, and workload limits with tracked status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-6 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Attrition Predictor Pro</span>
            <span aria-hidden="true">·</span>
            <span>Enterprise retention command center</span>
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            Username: masterclass · Password: agentic26
          </div>
        </div>
      </footer>
    </div>
  );
};
