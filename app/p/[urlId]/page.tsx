'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface PublishedPromptData {
  promptId: string;
  promptText: string;
  configName: string;
  publishedAt: string;
}

export default function PublishedPromptPage() {
  const params = useParams();
  const urlId = params.urlId as string;
  const [promptData, setPromptData] = useState<PublishedPromptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!urlId) return;

    const fetchPrompt = async () => {
      try {
        const response = await fetch(`/api/p/${urlId}`);
        const data = await response.json();

        if (response.ok) {
          setPromptData(data);
        } else {
          setError(data.error || 'Failed to load prompt');
        }
      } catch (err) {
        setError('An error occurred while loading the prompt');
      } finally {
        setLoading(false);
      }
    };

    fetchPrompt();
  }, [urlId]);

  const copyToClipboard = async () => {
    if (promptData) {
      await navigator.clipboard.writeText(promptData.promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-robinhood-dark flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-robinhood-green/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-robinhood-green animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-white text-lg font-semibold">Loading Prompt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-robinhood-dark flex items-center justify-center p-6">
        <div className="bg-robinhood-card border-2 border-red-500/50 rounded-xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Prompt Not Found</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-robinhood-dark p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-robinhood-card border border-robinhood-green rounded-xl p-6 mb-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {promptData?.configName || 'System Prompt Template'}
              </h1>
              <p className="text-sm text-gray-400">
                Published on {new Date(promptData?.publishedAt || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={copyToClipboard}
                className="px-5 py-3 bg-robinhood-green text-robinhood-dark font-bold rounded-lg hover:bg-robinhood-green/90 transition-all shadow-lg flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Prompt Content */}
        <div className="bg-robinhood-card border border-robinhood-border rounded-xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-robinhood-border bg-robinhood-darker">
            <h2 className="text-lg font-semibold text-white">System Prompt Template</h2>
          </div>
          <div className="p-6 bg-robinhood-darker/50">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-robinhood-dark p-6 rounded-lg border border-robinhood-border overflow-x-auto">
              {promptData?.promptText}
            </pre>
          </div>
          <div className="px-6 py-4 border-t border-robinhood-border bg-robinhood-darker flex items-center justify-between">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-robinhood-green">Character Count:</span> {promptData?.promptText.length.toLocaleString()}
            </p>
            <a
              href="/"
              className="text-sm text-robinhood-green hover:text-robinhood-green/80 font-medium flex items-center gap-2"
            >
              Create Your Own Template
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-blue-300 flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>This is a publicly shared system prompt template. You can copy it and use it for your own AI projects.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
