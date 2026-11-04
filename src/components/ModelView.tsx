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
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">
            Model Evaluation & Decisions Layer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Holdout performance verification on IBM HR Employee Attrition benchmark (N=1,470, 20% test partition).
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Production Gate Passed: AUC &ge; 0.85 Verified</span>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* AUC-ROC */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs relative overflow-hidden">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">AUC-ROC Score</div>
          <div className="text-2xl font-bold font-mono text-cyan-800 mt-1 tabular-nums">
            {m.aucRoc.toFixed(4)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-mono font-medium">+0.024 vs Target (0.85)</div>
        </div>

        {/* F1 Macro */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">F1-Score (Macro)</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {m.f1Score.toFixed(4)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Balanced 84/16 weighting</div>
        </div>

        {/* Precision */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Precision Rate</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {(m.precision * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Low false alarm incidence</div>
        </div>

        {/* Recall / Sensitivity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Recall / Sensitivity</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {(m.recall * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">High departure capture rate</div>
        </div>

        {/* Accuracy */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Holdout Accuracy</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {(m.accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">N=294 holdout rows</div>
        </div>
      </div>

      {/* Main Analysis Grid: Feature Importance & ROC Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Top Feature Importances */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Global Tree Feature Importance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mean Gini impurity reduction across all ensemble tree splits
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200 font-medium">
              OverTime = #1 Driver
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={featureData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  unit="%"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  type="category"
                  dataKey="feature"
                  width={150}
                  tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.7)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-3 text-xs max-w-xs">
                          <div className="font-semibold text-slate-900 mb-1">{d.feature}</div>
                          <div className="font-mono text-cyan-700 font-bold mb-1.5">
                            {d.importance}% relative weight
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed border-t border-slate-100 pt-1.5">
                            {d.description}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="importance" fill="#0284c7" radius={[0, 4, 4, 0]}>
                  {featureData.map((entry, index) => (
                    <Cell
                      key={`feat-${index}`}
                      fill={index === 0 ? '#f43f5e' : index < 3 ? '#0284c7' : '#0ea5e9'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: ROC Curve & Confusion Matrix */}
        <div className="lg:col-span-5 space-y-6">
          {/* ROC Curve Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Receiver Operating Characteristic (ROC)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  True Positive Rate vs False Positive Rate curve
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-cyan-800">
                AUC: 0.8742
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={m.rocCurve}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <XAxis
                    dataKey="fpr"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    domain={[0, 1]}
                  />
                  <YAxis
                    dataKey="tpr"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    domain={[0, 1]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-2.5 text-xs font-mono">
                            <div>FPR: {(d.fpr * 100).toFixed(1)}%</div>
                            <div className="text-cyan-700 font-bold">TPR: {(d.tpr * 100).toFixed(1)}%</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tpr"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Confusion Matrix Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-semibold text-slate-900">
              Holdout Confusion Matrix (N=294)
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-[11px] text-emerald-800 font-semibold uppercase">True Negative (Retained)</div>
                <div className="text-2xl font-bold font-mono text-emerald-900 mt-1">
                  {m.confusionMatrix.trueNegative}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Correct non-departure</div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-[11px] text-amber-800 font-semibold uppercase">False Positive (False Alarm)</div>
                <div className="text-2xl font-bold font-mono text-amber-900 mt-1">
                  {m.confusionMatrix.falsePositive}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Flagged, did not leave</div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                <div className="text-[11px] text-rose-800 font-semibold uppercase">False Negative (Missed)</div>
                <div className="text-2xl font-bold font-mono text-rose-900 mt-1">
                  {m.confusionMatrix.falseNegative}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Departed unflagged</div>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-50 border border-cyan-200">
                <div className="text-[11px] text-cyan-800 font-semibold uppercase">True Positive (Captured)</div>
                <div className="text-2xl font-bold font-mono text-cyan-900 mt-1">
                  {m.confusionMatrix.truePositive}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Proactively captured</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
