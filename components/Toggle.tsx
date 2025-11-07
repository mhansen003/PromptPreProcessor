'use client';

import React from 'react';
import { Tooltip } from './Tooltip';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  tooltip?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  checked,
  onChange,
  description,
  tooltip,
}) => {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full
          border-2 border-transparent transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-1 focus:ring-robinhood-green focus:ring-offset-1
          focus:ring-offset-robinhood-dark
          ${checked ? 'bg-robinhood-green' : 'bg-robinhood-border'}
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
          <label className="text-sm font-medium text-gray-300 cursor-pointer">
            {label}
          </label>
          {tooltip && (
            <Tooltip content={tooltip}>
              <div className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-robinhood-green/20 text-robinhood-green text-[9px] font-bold cursor-help hover:bg-robinhood-green hover:text-robinhood-dark hover:scale-110 transition-all shadow-sm">
                i
              </div>
            </Tooltip>
          )}
        </div>
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};
