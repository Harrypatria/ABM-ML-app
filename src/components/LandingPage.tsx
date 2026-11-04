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
  Sparkles,
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
        setErrorMsg(result.errorMessage || 'Sign in failed. Please check your credentials.');
      }
    }, 250);
  };

  const handleFillDemo = () => {
    setUsername('masterclass');
    setPassword('agentic26');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-950">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              A
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-slate-900">
                Attrition Predictor <span className="text-cyan-600">Pro</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              1,470 Employee Benchmark Ready
            </span>
            <a
              href="#signin-section"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              Sign In
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>Enterprise Retention Intelligence & ITDO Framework</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-slate-900 leading-[1.12]">
                Predict voluntary departures <span className="text-cyan-600">before</span> exit interviews happen.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Replace retrospective exit surveys with proactive decision-making. Analyze flight risk across 35 workplace attributes, understand root causes through local SHAP explanations, and coordinate HR interventions in real time.
              </p>

              {/* Metric Highlights Strip */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/80 max-w-xl">
                <div>
                  <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">0.874</div>
                  <div className="text-xs text-slate-500 mt-0.5">Holdout AUC-ROC</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-cyan-600 tabular-nums">1,470</div>
                  <div className="text-xs text-slate-500 mt-0.5">Active Dataset Records</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">1.75x</div>
                  <div className="text-xs text-slate-500 mt-0.5">Salary Cost Multiplier</div>
                </div>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                  SHAP Waterfall Interpretability
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                  Insights to Operations Loop
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                  Calibrated Risk Gauges
                </span>
              </div>
            </div>

            {/* Right Column: Minimalist Modern Auth Card */}
            <div id="signin-section" className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 relative">
                {/* Demo Credentials Helper Badge */}
                <div className="mb-6 p-3 rounded-xl bg-cyan-50/70 border border-cyan-200/80 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-cyan-900 block">Evaluation Credentials:</span>
                    <span className="font-mono text-slate-600 text-[11px]">
                      Username: <strong className="text-cyan-800">masterclass</strong> · Password: <strong className="text-cyan-800">agentic26</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded bg-white text-cyan-800 border border-cyan-300 hover:bg-cyan-50 transition-colors whitespace-nowrap shadow-2xs"
                  >
                    Auto-Fill
                  </button>
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
                    Sign In
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your authorized workspace credentials to access the retention command center.
                  </p>
                </div>

                {/* Error Banner (Empathetic & Clear) */}
                {errorMsg && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{errorMsg}</span>
                  </div>
                )}

                {/* Sign In Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="auth-username"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="auth-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        autoComplete="username"
                        required
                        className="w-full pl-9 pr-3 py-2.5 text-xs font-mono bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="auth-password"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        autoComplete="current-password"
                        required
                        className="w-full pl-9 pr-10 py-2.5 text-xs font-mono bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 cursor-pointer disabled:opacity-70"
                    >
                      {isLoading ? (
                        <span>Signing In...</span>
                      ) : (
                        <>
                          <span>Sign In to Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Protected Enterprise System</span>
                  <span>v1.0.0 · ITDO Core</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Pillar Architecture Section */}
        <div className="border-t border-slate-200/80 bg-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
                The ITDO Retention Loop
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Turn predictive signals into concrete, trackable people operations in four connected stages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Step 1: Insights */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-cyan-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs font-mono mb-4">
                  01
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1.5">Insights (Model)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Calculates individual flight probabilities with calibrated Gradient Boosting trees across all 1,470 employees.
                </p>
              </div>

              {/* Step 2: Triggers */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-cyan-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs font-mono mb-4">
                  02
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1.5">Triggers (Alerts)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automatic critical triggers fire at &gt;70% predicted attrition, routing notifications directly to relevant HRBPs.
                </p>
              </div>

              {/* Step 3: Decisions */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-cyan-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs font-mono mb-4">
                  03
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1.5">Decisions (SHAP)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  SHAP waterfalls isolate top departure drivers (e.g. overtime workload, compensation band) for targeted intervention.
                </p>
              </div>

              {/* Step 4: Operations */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-cyan-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs font-mono mb-4">
                  04
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1.5">Operations (Tasks)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Assign concrete stay interviews, compensation reviews, and workload caps with deadlines and status tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Attrition Predictor Pro</span>
            <span>·</span>
            <span>Enterprise Retention Command Center</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Username: masterclass · Password: agentic26
          </div>
        </div>
      </footer>
    </div>
  );
};
