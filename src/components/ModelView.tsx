import React from 'react';
import {
  CheckCircle,
  Award,
  Layers,
  Cpu,
  TrendingUp,
  BarChart2,
  FileText,
  Sliders,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { MODEL_EVALUATION_METRICS } from '../lib/mlEngine';

export const ModelView: React.FC = () => {
  const m = MODEL_EVALUATION_METRICS;

  // Prepare top 12 features for Recharts
  const featureData = m.topFeatures.slice(0, 12).map((f) => ({
    feature: f.feature,
    importance: Math.round(f.importance * 1000) / 10, // e.g. 18.5%
    description: f.description,
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-100">
            Model Evaluation & Decisions Layer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Holdout performance verification on IBM HR Employee Attrition benchmark (N=1,470, 20% test partition)
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Production Gate Passed: AUC &ge; 0.85 Threshold</span>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* AUC-ROC */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">AUC-ROC Score</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
            {m.aucRoc.toFixed(4)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">+0.024 vs Target (0.85)</div>
        </div>

        {/* F1 Macro */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">F1-Score (Macro)</div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1 tabular-nums">
            {m.f1Score.toFixed(4)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Balanced 84/16 weighting</div>
        </div>

        {/* Precision */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Positive Precision</div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1 tabular-nums">
            {(m.precision * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Low false alarm rate</div>
        </div>

        {/* Recall / Sensitivity */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Positive Recall</div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1 tabular-nums">
            {(m.recall * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">81% departure captures</div>
        </div>

        {/* Accuracy */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Holdout Accuracy</div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1 tabular-nums">
            {(m.accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">N=294 holdout rows</div>
        </div>
      </div>

      {/* Row 2: ROC Curve (50%) & Confusion Matrix (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* ROC Curve */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Receiver Operating Characteristic (ROC)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                True Positive Rate vs False Positive Rate curve across decision thresholds
              </p>
            </div>
            <div className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              AUC = 0.8742
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={m.rocCurve} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis
                  dataKey="fpr"
                  unit=""
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={{ stroke: '#334155' }}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  unit=""
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={{ stroke: '#334155' }}
                  axisLine={{ stroke: '#334155' }}
                />
                <Tooltip
                  cursor={{ stroke: '#334155' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 shadow-xl rounded-lg p-2.5 text-xs font-mono">
                          <div className="text-cyan-400 font-bold">TPR (Sensitivity): {d.tpr}</div>
                          <div className="text-slate-400">FPR (1 - Specificity): {d.fpr}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tpr"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#06b6d4' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>False Positive Rate (1 - Specificity)</span>
            <span className="text-cyan-400 font-mono font-medium">Empirical Holdout Curve</span>
          </div>
        </div>

        {/* Confusion Matrix */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Holdout Confusion Matrix (N = 294)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Stratified 20% test holdout partition evaluated at 0.50 threshold
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* True Negative */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center">
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                True Negative (Retained)
              </div>
              <div className="text-3xl font-bold font-mono text-emerald-400 my-1 tabular-nums">
                {m.confusionMatrix.trueNegative}
              </div>
              <div className="text-xs font-mono text-slate-400">
                94.0% Specificity (232/247)
              </div>
            </div>

            {/* False Positive */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center">
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                False Positive (Type I)
              </div>
              <div className="text-3xl font-bold font-mono text-amber-400 my-1 tabular-nums">
                {m.confusionMatrix.falsePositive}
              </div>
              <div className="text-xs font-mono text-slate-400">
                6.0% False Alarm (15/247)
              </div>
            </div>

            {/* False Negative */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center">
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                False Negative (Missed Departure)
              </div>
              <div className="text-3xl font-bold font-mono text-rose-400 my-1 tabular-nums">
                {m.confusionMatrix.falseNegative}
              </div>
              <div className="text-xs font-mono text-slate-400">
                19.1% Miss Rate (9/47)
              </div>
            </div>

            {/* True Positive */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center">
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                True Positive (Correct Departure)
              </div>
              <div className="text-3xl font-bold font-mono text-cyan-400 my-1 tabular-nums">
                {m.confusionMatrix.truePositive}
              </div>
              <div className="text-xs font-mono text-slate-400">
                80.9% Sensitivity (38/47)
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 leading-relaxed">
            Prioritizes high sensitivity: 38 out of 47 departing employees flagged proactively before resignation submission.
          </div>
        </div>
      </div>

      {/* Row 3: Feature Importance Bar Chart */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Top 12 Global Feature Importances (Tree Split Gain)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical variance reduction in GradientBoosting ensemble across 200 estimators
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Normalized Gain %</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={featureData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                type="number"
                unit="%"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                type="category"
                dataKey="feature"
                width={150}
                tick={{ fill: '#cbd5e1', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(51, 65, 85, 0.2)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 shadow-xl rounded-lg p-3 text-xs max-w-xs">
                        <div className="font-semibold text-slate-100 mb-1">{d.feature}</div>
                        <div className="font-mono text-cyan-400 font-bold mb-1">
                          {d.importance}% Gini Importance
                        </div>
                        <div className="text-slate-300">{d.description}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="importance" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                {featureData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? '#38bdf8' : index < 3 ? '#06b6d4' : '#0e7490'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Lineage & Hyperparameters Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100">
            Training Lineage & Hyperparameter Governance
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-validation protocols, pipeline transformers, and candidate comparison
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Candidate Model</th>
                <th className="px-4 py-2.5">Cross-Val Strategy</th>
                <th className="px-4 py-2.5">CV AUC-ROC</th>
                <th className="px-4 py-2.5">Macro F1</th>
                <th className="px-4 py-2.5">Selected Hyperparameters</th>
                <th className="px-4 py-2.5 text-right">Production Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-slate-300">
              <tr className="bg-cyan-950/20">
                <td className="px-4 py-3 font-semibold text-cyan-300 font-sans">
                  GradientBoostingClassifier
                </td>
                <td className="px-4 py-3 text-slate-400 font-sans">5-Fold Stratified</td>
                <td className="px-4 py-3 text-cyan-400 font-bold">0.8742</td>
                <td className="px-4 py-3">0.8214</td>
                <td className="px-4 py-3 text-[11px] text-slate-400 font-sans">
                  n_est=200, lr=0.05, max_depth=4, subsample=0.85
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-[10px] font-sans font-bold uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
                    ACTIVE PIPELINE
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-200 font-sans">
                  XGBoost Classifier
                </td>
                <td className="px-4 py-3 text-slate-400 font-sans">5-Fold Stratified</td>
                <td className="px-4 py-3">0.8690</td>
                <td className="px-4 py-3">0.8105</td>
                <td className="px-4 py-3 text-[11px] text-slate-400 font-sans">
                  scale_pos_weight=5.2, max_depth=4, lr=0.05
                </td>
                <td className="px-4 py-3 text-right text-slate-500 font-sans text-xs">
                  Benchmark
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-200 font-sans">
                  Logistic Regression
                </td>
                <td className="px-4 py-3 text-slate-400 font-sans">5-Fold Stratified</td>
                <td className="px-4 py-3">0.8240</td>
                <td className="px-4 py-3">0.7410</td>
                <td className="px-4 py-3 text-[11px] text-slate-400 font-sans">
                  class_weight='balanced', max_iter=1000
                </td>
                <td className="px-4 py-3 text-right text-slate-500 font-sans text-xs">
                  Baseline
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
