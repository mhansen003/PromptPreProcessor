'use client';

import React from 'react';
import { Tooltip } from './Tooltip';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  tooltip?: string;
  onShowExample?: () => void;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  checked,
  onChange,
  description,
  tooltip,
  onShowExample,
  disabled = false,
}) => {
  return (
    <div className={`flex items-start gap-3 ${disabled ? 'opacity-40' : ''}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex h-5 w-9 flex-shrink-0 rounded-full
          border-2 border-transparent transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-1 focus:ring-robinhood-green focus:ring-offset-1
          focus:ring-offset-robinhood-dark
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${checked ? 'bg-robinhood-green' : 'bg-robinhood-border'}
          ${disabled && 'grayscale'}
        `}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-4 w-4 transform rounded-full
            bg-white shadow ring-0 transition duration-200 ease-in-out
            ${checked ? 'translate-x-4' : 'translate-x-0'}
          `}
        />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <label className={`text-sm font-medium ${disabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 cursor-pointer'}`}>
            {label}
          </label>
          {tooltip && (
            <Tooltip content={tooltip}>
              <div className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-robinhood-green/20 text-robinhood-green text-[9px] font-bold cursor-help hover:bg-robinhood-green hover:text-robinhood-dark hover:scale-110 transition-all shadow-sm">
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
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};
