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
  let badgeColor = 'text-emerald-800 bg-emerald-50 border-emerald-200';
  let badgeText = 'Low Flight Risk';

  if (riskLevel === 'MEDIUM') {
    strokeColor = '#f59e0b'; // amber
    badgeColor = 'text-amber-800 bg-amber-50 border-amber-200';
    badgeText = 'Moderate Flight Risk';
  } else if (riskLevel === 'HIGH') {
    strokeColor = '#e11d48'; // rose
    badgeColor = 'text-rose-800 bg-rose-50 border-rose-200';
    badgeText = 'High Departure Risk';
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
            stroke="rgba(226, 232, 240, 0.9)"
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
          <span className="text-3xl font-bold font-mono tracking-tight tabular-nums text-slate-900">
            {percentage}%
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-0.5">
            Flight Probability
          </span>
        </div>
      </div>

      {/* Risk Badge */}
      <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${badgeColor}`}>
        {badgeText}
      </div>
    </div>
  );
};
