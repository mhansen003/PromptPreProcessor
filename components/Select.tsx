'use client';

import React from 'react';
import { Tooltip } from './Tooltip';

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; description?: string }[];
  description?: string;
  tooltip?: string | React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  description,
  tooltip,
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        {tooltip && (
          <Tooltip content={tooltip}>
            <div className="flex items-center justify-center w-4 h-4 rounded-full bg-robinhood-green/20 text-robinhood-green text-[10px] font-bold cursor-help hover:bg-robinhood-green hover:text-robinhood-dark hover:scale-110 transition-all shadow-sm">
              i
            </div>
          </Tooltip>
        )}
      </div>
      {description && (
        <p className="text-[10px] text-gray-500">{description}</p>
      )}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full px-3 py-1.5 text-sm bg-robinhood-card border border-robinhood-border
          rounded-lg text-white focus:outline-none focus:ring-1
          focus:ring-robinhood-green focus:border-transparent
          cursor-pointer transition-all
          hover:border-robinhood-green/50
        "
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
