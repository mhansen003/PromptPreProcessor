'use client';

import React from 'react';

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
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        {showValue && (
          <span className="text-sm font-mono text-robinhood-green">{value}</span>
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
          className="slider-input w-full h-2 bg-robinhood-border rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #00C805 0%, #00C805 ${percentage}%, #2A2A2A ${percentage}%, #2A2A2A 100%)`,
          }}
        />
      </div>

      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}

      <style jsx>{`
        .slider-input::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #00C805;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 200, 5, 0.5);
          transition: all 0.2s;
        }

        .slider-input::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 15px rgba(0, 200, 5, 0.8);
        }

        .slider-input::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #00C805;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(0, 200, 5, 0.5);
          transition: all 0.2s;
        }

        .slider-input::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 15px rgba(0, 200, 5, 0.8);
        }
      `}</style>
    </div>
  );
};
