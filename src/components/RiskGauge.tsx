import React from 'react';
import { RiskLevel } from '../types';

interface RiskGaugeProps {
  probability: number; // 0.0 - 1.0
  riskLevel: RiskLevel;
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ probability, riskLevel, size = 190 }) => {
  const percentage = Math.round(probability * 100);
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Semi-arc from 135deg to 405deg (270 degrees total span)
  const arcSpan = 270;
  const arcLength = (arcSpan / 360) * circumference;
  const strokeDashoffset = arcLength - (percentage / 100) * arcLength;

  let strokeColor = '#10b981'; // green for LOW
  let badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (riskLevel === 'MEDIUM') {
    strokeColor = '#f59e0b'; // amber
    badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  } else if (riskLevel === 'HIGH') {
    strokeColor = '#f43f5e'; // rose/red
    badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  }

  const rotation = 135;

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(51, 65, 85, 0.35)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
          />
          {/* Active indicator arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-2">
          <span className="text-3xl font-bold font-mono tracking-tight tabular-nums text-slate-100">
            {percentage}%
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mt-0.5">
            Flight Probability
          </span>
        </div>
      </div>

      {/* Risk Badge */}
      <div
        className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border -mt-2 transition-colors ${badgeColor}`}
      >
        {riskLevel} FLIGHT RISK
      </div>
    </div>
  );
};
