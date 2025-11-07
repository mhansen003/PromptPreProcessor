'use client';

import React, { useState, useEffect } from 'react';
import { Slider } from './Slider';
import { Toggle } from './Toggle';
import { Select } from './Select';

interface ExampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  controlType: 'slider' | 'toggle' | 'select';
  controlName: string;
  controlDescription?: string;
  initialValue: number | boolean | string;
  onApply: (value: number | boolean | string) => void;
  // For slider
  min?: number;
  max?: number;
  // For select
  options?: Array<{ value: string; label: string }>;
}

export default function ExampleModal({
  isOpen,
  onClose,
  controlType,
  controlName,
  controlDescription,
  initialValue,
  onApply,
  min = 0,
  max = 100,
  options = [],
}: ExampleModalProps) {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [exampleText, setExampleText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate example when modal opens or value changes
  useEffect(() => {
    if (isOpen) {
      generateExample();
    }
  }, [isOpen, currentValue]);

  const generateExample = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          controlType,
          controlName,
          controlValue: currentValue,
          controlDescription,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setExampleText(data.exampleText);
      } else {
        setExampleText('Failed to generate example. Please try again.');
      }
    } catch (error) {
      console.error('Error generating example:', error);
      setExampleText('Error generating example. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(currentValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-indigo-900/40 via-robinhood-dark to-purple-900/40 border-2 border-indigo-500/50 rounded-xl max-w-2xl w-full shadow-2xl shadow-indigo-500/20">
        {/* Header */}
        <div className="p-6 border-b border-indigo-500/30 flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Example: {controlName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Control */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              Adjust Setting
            </h3>
            <div className="bg-robinhood-card p-4 rounded-lg border border-indigo-500/30">
              {controlType === 'slider' && (
                <Slider
                  label={controlName}
                  value={currentValue as number}
                  onChange={(value) => setCurrentValue(value)}
                  min={min}
                  max={max}
                  tooltip={controlDescription}
                />
              )}

              {controlType === 'toggle' && (
                <Toggle
                  label={controlName}
                  checked={currentValue as boolean}
                  onChange={(checked) => setCurrentValue(checked)}
                  description={controlDescription}
                />
              )}

              {controlType === 'select' && (
                <Select
                  label={controlName}
                  value={currentValue as string}
                  onChange={(value) => setCurrentValue(value)}
                  options={options}
                  tooltip={controlDescription}
                />
              )}
            </div>
          </div>

          {/* Generated Example */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Example Output
              </h3>
              <button
                onClick={generateExample}
                disabled={isGenerating}
                className={`px-3 py-1 text-xs rounded-lg transition-all ${
                  isGenerating
                    ? 'bg-indigo-500/30 border-2 border-indigo-500 text-white animate-pulse shadow-lg shadow-indigo-500/50'
                    : 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/30'
                }`}
              >
                {isGenerating ? '✨ Generating...' : '🔄 Regenerate'}
              </button>
            </div>

            <div
              className={`bg-robinhood-card p-4 rounded-lg border min-h-[120px] flex items-center justify-center transition-all ${
                isGenerating
                  ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 animate-pulse'
                  : 'border-indigo-500/30'
              }`}
            >
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3">
                  <svg className="w-8 h-8 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm text-indigo-400 font-medium">Generating example...</p>
                </div>
              ) : (
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {exampleText || 'Example will appear here...'}
                </p>
              )}
            </div>

            <p className="text-xs text-gray-400">
              This example shows how responses will look with the current setting value. Adjust the control above and regenerate to see different results.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-indigo-500/30 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-robinhood-card border border-indigo-500/30 rounded-lg hover:bg-robinhood-card-hover transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-indigo-500/30 text-indigo-400 border border-indigo-500/50 rounded-lg hover:bg-indigo-500/40 transition-all shadow-lg shadow-indigo-500/10"
          >
            Apply Setting
          </button>
        </div>
      </div>
    </div>
  );
}
