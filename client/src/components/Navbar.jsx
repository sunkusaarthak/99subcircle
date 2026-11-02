import React from 'react';
import { Plus, History, Check, AlertCircle, Send } from 'lucide-react';
import { LogoBrand } from './Logo';

export default function Navbar({ status, onNewGroup, onOpenLogs, onOpenTestEmail }) {
  const isMock = status?.email?.mode === 'mock';
  const isError = status?.email?.mode === 'error';

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Brand with human-crafted mark */}
          <div className="flex items-center space-x-4">
            <LogoBrand size={22} showTagline={true} />
          </div>

          {/* Minimal Controls */}
          <div className="flex items-center space-x-2.5">
            {/* Minimal Email Status Indicator */}
            <div
              className={`hidden sm:inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-mono transition ${
                isError
                  ? 'border-zinc-300 text-zinc-900 bg-zinc-100'
                  : isMock
                    ? 'border-zinc-200 text-zinc-500 bg-zinc-50'
                    : 'border-black text-black bg-white'
              }`}
              title={status?.email?.message}
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                isError ? 'bg-zinc-800' : isMock ? 'bg-zinc-400' : 'bg-black'
              }`} />
              <span>
                {isError ? 'smtp offline' : isMock ? 'mock mode' : 'smtp live'}
              </span>
            </div>

            {/* Test Email Button */}
            <button
              onClick={onOpenTestEmail}
              className="inline-flex items-center px-3 py-1.5 text-xs font-mono text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg transition"
              title="Send a quick test email"
            >
              <Send className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">test</span>
            </button>

            {/* History Logs Button */}
            <button
              onClick={onOpenLogs}
              className="inline-flex items-center px-3 py-1.5 text-xs font-mono text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg transition"
            >
              <History className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">logs</span>
            </button>

            {/* New Circle / Group Button */}
            <button
              onClick={onNewGroup}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium text-white bg-black hover:bg-zinc-800 rounded-lg transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>New Circle</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
