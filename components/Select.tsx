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
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full px-4 py-2 bg-robinhood-card border border-robinhood-border
          rounded-lg text-white focus:outline-none focus:ring-2
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
