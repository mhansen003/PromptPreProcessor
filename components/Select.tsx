'use client';

import React from 'react';

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  description?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  description,
}) => {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-300">{label}</label>
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
