'use client';

import React, { useState, useEffect } from 'react';
import type { PersonaConfig } from '@/lib/store';

interface Sample {
  title: string;
  content: string;
}

interface SampleMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PersonaConfig | null;
  scenario: 'loan-product' | 'borrower-pitch' | 'document-request';
}

export default function SampleMessagesModal({ isOpen, onClose, config, scenario }: SampleMessagesModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && config) {
      generateSamples();
    }
  }, [isOpen, config, scenario]);

  const generateSamples = async () => {
    if (!config) return;

    setIsGenerating(true);
    setError(null);
    setSamples([]);

    try {
      const response = await fetch('/api/generate-samples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, scenario }),
      });

      const data = await response.json();

      if (data.success && data.samples) {
        setSamples(data.samples);
      } else {
        setError(data.error || 'Failed to generate samples');
      }
    } catch (err: any) {
      console.error('Error generating samples:', err);
      setError('Failed to generate samples. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  // Define color themes based on scenario
  const themeColors = {
    'loan-product': {
      gradientFrom: 'from-blue-900/40',
      gradientTo: 'to-cyan-900/40',
      border: 'border-blue-500/50',
      borderLight: 'border-blue-500/30',
      borderHover: 'border-blue-500/50',
      shadow: 'shadow-blue-500/20',
      textGradient: 'from-blue-400 to-cyan-400',
      spinner: 'border-t-blue-500',
      spinnerBg: 'border-blue-500/20',
      dot: 'bg-blue-500',
      badge: 'bg-blue-500/20 text-blue-400',
      button: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30',
    },
    'borrower-pitch': {
      gradientFrom: 'from-green-900/40',
      gradientTo: 'to-emerald-900/40',
      border: 'border-green-500/50',
      borderLight: 'border-green-500/30',
      borderHover: 'border-green-500/50',
      shadow: 'shadow-green-500/20',
      textGradient: 'from-green-400 to-emerald-400',
      spinner: 'border-t-green-500',
      spinnerBg: 'border-green-500/20',
      dot: 'bg-green-500',
      badge: 'bg-green-500/20 text-green-400',
      button: 'bg-green-500/20 text-green-400 hover:bg-green-500/30',
    },
    'document-request': {
      gradientFrom: 'from-purple-900/40',
      gradientTo: 'to-violet-900/40',
      border: 'border-purple-500/50',
      borderLight: 'border-purple-500/30',
      borderHover: 'border-purple-500/50',
      shadow: 'shadow-purple-500/20',
      textGradient: 'from-purple-400 to-violet-400',
      spinner: 'border-t-purple-500',
      spinnerBg: 'border-purple-500/20',
      dot: 'bg-purple-500',
      badge: 'bg-purple-500/20 text-purple-400',
      button: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30',
    },
  };

  const colors = themeColors[scenario];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-gradient-to-br ${colors.gradientFrom} via-robinhood-dark ${colors.gradientTo} border-2 ${colors.border} rounded-xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl ${colors.shadow}`}>
        {/* Header */}
        <div className={`p-6 border-b ${colors.borderLight} flex items-center justify-between flex-shrink-0`}>
          <div>
            <h2 className={`text-2xl font-bold bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent`}>
              Sample Messages
            </h2>
            {config && (
              <p className="text-sm text-gray-400 mt-1">
                Generated using "{config.name}" persona configuration
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl transition-colors"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative w-20 h-20 mb-6">
                {/* Animated spinner */}
                <div className={`absolute inset-0 border-4 ${colors.spinnerBg} rounded-full`}></div>
                <div className={`absolute inset-0 border-4 border-transparent ${colors.spinner} rounded-full animate-spin`}></div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Generating Samples...</h3>
              <p className="text-gray-400 text-center max-w-md">
                Creating 3 unique mortgage scenarios based on your persona configuration.
                This may take a few moments.
              </p>
              {/* Progress dots */}
              <div className="flex items-center gap-2 mt-6">
                <div className={`w-2 h-2 ${colors.dot} rounded-full animate-pulse`}></div>
                <div className={`w-2 h-2 ${colors.dot} rounded-full animate-pulse`} style={{ animationDelay: '0.2s' }}></div>
                <div className={`w-2 h-2 ${colors.dot} rounded-full animate-pulse`} style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Error Generating Samples</h3>
              <p className="text-red-400 text-center max-w-md mb-4">{error}</p>
              <button
                onClick={generateSamples}
                className={`px-4 py-2 ${colors.button} rounded-lg transition-all`}
              >
                Try Again
              </button>
            </div>
          ) : samples.length > 0 ? (
            <div className="space-y-6">
              {samples.map((sample, index) => (
                <div
                  key={index}
                  className={`bg-robinhood-card border ${colors.borderLight} rounded-lg p-6 hover:${colors.borderHover} transition-all`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${colors.badge} rounded-lg flex items-center justify-center font-bold`}>
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        {sample.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(sample.content);
                        // Could add a toast notification here
                      }}
                      className={`px-3 py-1.5 ${colors.button} rounded transition-all text-xs font-medium`}
                      title="Copy to clipboard"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {sample.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-16 text-gray-400">
              No samples generated yet
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${colors.borderLight} flex items-center justify-between flex-shrink-0`}>
          <p className="text-xs text-gray-400">
            💡 These samples demonstrate how your persona will communicate based on current settings
          </p>
          <div className="flex gap-3">
            {!isGenerating && samples.length > 0 && (
              <button
                onClick={generateSamples}
                className={`px-4 py-2 ${colors.button} border ${colors.border} rounded-lg transition-all`}
              >
                🔄 Regenerate
              </button>
            )}
            <button
              onClick={onClose}
              className={`px-6 py-2 bg-robinhood-card border ${colors.borderLight} rounded-lg hover:bg-robinhood-card-hover transition-all`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
