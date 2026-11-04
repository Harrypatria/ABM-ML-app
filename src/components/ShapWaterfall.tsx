import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import { RiskFactor } from '../types';

interface ShapWaterfallProps {
  factors: RiskFactor[];
  baseValue: number;
  finalProbability: number;
}

export const ShapWaterfall: React.FC<ShapWaterfallProps> = ({
  factors,
  baseValue,
  finalProbability,
}) => {
  // Prepare data for horizontal bar visualization
  const chartData = factors.map((f) => ({
    feature: f.feature,
    value: f.featureValue,
    impactPct: Math.round(f.impact * 1000) / 10, // e.g. +27.5% or -12.2%
    direction: f.direction,
    description: f.description,
  }));

  return (
    <div className="w-full bg-white rounded-xl p-4.5 border border-slate-200 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">SHAP Root-Cause Drivers</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Marginal probability contribution relative to the company benchmark baseline (16.1%)
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 inline-block" />
            <span>Baseline: {(baseValue * 100).toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
            <span>Increases Risk</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            <span>Reduces Risk</span>
          </div>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[-30, 35]}
              unit="%"
              tick={{ fill: '#475569', fontSize: 11 }}
              tickLine={{ stroke: '#cbd5e1' }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              type="category"
              dataKey="feature"
              width={140}
              tick={{ fill: '#1e293b', fontSize: 12, fontWeight: 500 }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(241, 245, 249, 0.7)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  const isPos = d.impactPct > 0;
                  return (
                    <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-3 text-xs max-w-xs">
                      <div className="font-semibold text-slate-900 mb-1">{d.feature}</div>
                      <div className="text-[11px] text-slate-600 mb-2">
                        Observed value: <strong className="text-slate-900">{d.value}</strong>
                      </div>
                      <div
                        className={`font-mono font-semibold text-xs mb-1.5 ${
                          isPos ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {d.impactPct}% shift on flight probability
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-1.5">
                        {d.description}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
            <Bar dataKey="impactPct" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.direction === 'increases' ? '#f43f5e' : '#10b981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Model Base Value: {(baseValue * 100).toFixed(1)}%</span>
        <span>
          Net Calibrated Outcome:{' '}
          <strong className="font-mono text-slate-900 text-xs">
            {(finalProbability * 100).toFixed(1)}%
          </strong>
        </span>
      </div>
    </div>
  );
};
