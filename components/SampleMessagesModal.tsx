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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-blue-900/40 via-robinhood-dark to-cyan-900/40 border-2 border-blue-500/50 rounded-xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-blue-500/20">
        {/* Header */}
        <div className="p-6 border-b border-blue-500/30 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
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
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Generating Samples...</h3>
              <p className="text-gray-400 text-center max-w-md">
                Creating 3 unique mortgage scenarios based on your persona configuration.
                This may take a few moments.
              </p>
              {/* Progress dots */}
              <div className="flex items-center gap-2 mt-6">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : samples.length > 0 ? (
            <div className="space-y-6">
              {samples.map((sample, index) => (
                <div
                  key={index}
                  className="bg-robinhood-card border border-blue-500/30 rounded-lg p-6 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold">
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
                      className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-all text-xs font-medium"
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
        <div className="p-6 border-t border-blue-500/30 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-gray-400">
            💡 These samples demonstrate how your persona will communicate based on current settings
          </p>
          <div className="flex gap-3">
            {!isGenerating && samples.length > 0 && (
              <button
                onClick={generateSamples}
                className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
              >
                🔄 Regenerate
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-robinhood-card border border-blue-500/30 rounded-lg hover:bg-robinhood-card-hover transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
