'use client';

import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  examples?: {
    low: string;
    high: string;
  };
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, examples, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64">
          <div className="bg-robinhood-darker border border-robinhood-green/50 rounded-lg p-3 shadow-xl">
            <p className="text-xs text-gray-300 mb-2">{content}</p>

            {examples && (
              <div className="space-y-2 pt-2 border-t border-robinhood-border">
                <div>
                  <span className="text-xs font-semibold text-blue-400">Low: </span>
                  <span className="text-xs text-gray-400 italic">{examples.low}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-red-400">High: </span>
                  <span className="text-xs text-gray-400 italic">{examples.high}</span>
                </div>
              </div>
            )}
          </div>
          <div className="w-3 h-3 bg-robinhood-darker border-l border-b border-robinhood-green/50 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      )}
    </div>
  );
};
