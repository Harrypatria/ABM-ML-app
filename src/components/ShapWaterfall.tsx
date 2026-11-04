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
    <div className="w-full bg-slate-900/60 rounded-xl p-4 border border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/80">
        <div>
          <h4 className="text-sm font-semibold text-slate-200">SHAP Local Feature Attributions</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Marginal probability contribution relative to benchmark baseline
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-600 inline-block" />
            <span>E[f(X)]: {(baseValue * 100).toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
            <span>Increases Risk</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" />
            <span>Protective</span>
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
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              type="category"
              dataKey="feature"
              width={140}
              tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(51, 65, 85, 0.3)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const isPositive = data.impactPct > 0;
                  return (
                    <div className="bg-slate-900 border border-slate-700 shadow-xl rounded-lg p-3 max-w-xs text-xs">
                      <div className="font-semibold text-slate-100 flex items-center justify-between gap-2 mb-1">
                        <span>{data.feature}</span>
                        <span className="font-mono text-slate-400">{data.value}</span>
                      </div>
                      <div className={`font-mono font-medium mb-1.5 ${isPositive ? 'text-rose-400' : 'text-cyan-400'}`}>
                        {isPositive ? '+' : ''}{data.impactPct}% attrition probability delta
                      </div>
                      <p className="text-slate-300 leading-relaxed">{data.description}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine x={0} stroke="#64748b" strokeDasharray="3 3" />
            <Bar dataKey="impactPct" radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.impactPct >= 0 ? '#f43f5e' : '#06b6d4'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
        <span className="font-mono">Base Rate: {(baseValue * 100).toFixed(1)}%</span>
        <span className="font-medium text-slate-300">
          Net Attributed Probability:{' '}
          <span className="font-mono font-semibold text-cyan-400 tabular-nums">
            {(finalProbability * 100).toFixed(1)}%
          </span>
        </span>
      </div>
    </div>
  );
};
