'use client';

import React from 'react';
import { Tooltip } from './Tooltip';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  leftLabel?: string;
  rightLabel?: string;
  showValue?: boolean;
  tooltip?: string;
  onShowExample?: () => void;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  leftLabel,
  rightLabel,
  showValue = true,
  tooltip,
  onShowExample,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  // Calculate color based on position (blue to red gradient)
  const getColor = (percent: number) => {
    const r = Math.round(59 + (239 - 59) * (percent / 100)); // 3B to EF
    const g = Math.round(130 - (130 - 68) * (percent / 100)); // 82 to 44
    const b = Math.round(246 - (246 - 68) * (percent / 100)); // F6 to 44
    return `rgb(${r}, ${g}, ${b})`;
  };

  const currentColor = getColor(percentage);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-300">
            {label}
          </label>
          {tooltip && (
            <Tooltip content={tooltip}>
              <div className="flex items-center justify-center w-4 h-4 rounded-full bg-robinhood-green/20 text-robinhood-green text-[10px] font-bold cursor-help hover:bg-robinhood-green hover:text-robinhood-dark hover:scale-110 transition-all shadow-sm">
                i
              </div>
            </Tooltip>
          )}
          {onShowExample && (
            <button
              onClick={onShowExample}
              className="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 rounded hover:bg-indigo-500/30 transition-all shadow-sm hover:shadow-indigo-500/20"
              title="See example of this setting"
            >
              ✨ Example
            </button>
          )}
        </div>
        {showValue && (
          <span className="text-sm font-mono" style={{ color: currentColor }}>
            {value}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider-input w-full h-1.5 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right,
              ${currentColor} 0%,
              ${currentColor} ${percentage}%,
              #2A2A2A ${percentage}%,
              #2A2A2A 100%)`,
          }}
        />
      </div>

      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-xs text-gray-500">
          <span className="text-blue-400">{leftLabel}</span>
          <span className="text-red-400">{rightLabel}</span>
        </div>
      )}

      <style jsx>{`
        .slider-input::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${currentColor};
          cursor: pointer;
          box-shadow: 0 0 8px ${currentColor}80;
          transition: all 0.2s;
          border: 2px solid white;
        }

        .slider-input::-webkit-slider-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 0 12px ${currentColor};
        }

        .slider-input::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${currentColor};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 8px ${currentColor}80;
          transition: all 0.2s;
        }

        .slider-input::-moz-range-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 0 12px ${currentColor};
        }
      `}</style>
    </div>
  );
};
