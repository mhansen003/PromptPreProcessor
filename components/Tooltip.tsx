'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  delay = 200
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, adjustedLeft: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const tooltipWidth = 280; // max-w-[280px]

        // Calculate initial position (centered above element)
        let left = rect.left + rect.width / 2;
        let adjustedLeft = left;

        // Boundary checking - ensure tooltip stays within viewport
        const viewportWidth = window.innerWidth;
        const padding = 16; // 1rem padding from edges

        // Check if tooltip would overflow right edge
        if (left + tooltipWidth / 2 > viewportWidth - padding) {
          adjustedLeft = viewportWidth - tooltipWidth / 2 - padding;
        }

        // Check if tooltip would overflow left edge
        if (left - tooltipWidth / 2 < padding) {
          adjustedLeft = tooltipWidth / 2 + padding;
        }

        setPosition({
          top: rect.top - 8,
          left: left,
          adjustedLeft: adjustedLeft,
        });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-flex items-center"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className="fixed z-50 pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.adjustedLeft}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="relative">
            {/* Tooltip content */}
            <div className="bg-robinhood-darker border-2 border-robinhood-green rounded-lg px-3 py-2 shadow-2xl max-w-[280px]">
              <p className="text-xs text-gray-200 leading-snug whitespace-normal break-words font-medium">
                {content}
              </p>
            </div>

            {/* Arrow pointing down */}
            <div
              className="absolute -bottom-2 w-0 h-0"
              style={{
                // Position arrow at original hover point, not tooltip center
                left: `${position.left - position.adjustedLeft + 140}px`,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid rgb(0, 200, 83)', // robinhood-green
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
