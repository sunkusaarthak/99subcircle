import React from 'react';
import { X, ExternalLink, Mail } from 'lucide-react';

export default function EmailPreviewModal({ isOpen, onClose, group }) {
  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full shadow-2xl border border-zinc-200 overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-black" />
            <div>
              <h3 className="text-sm font-semibold text-zinc-950">
                Email Dispatch Preview: {group.name}
              </h3>
              <p className="text-xs font-mono text-zinc-400">
                99subcircle monthly notification sent to the responsible member
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <a
              href={`/api/groups/${group.id}/preview-email`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-100 transition"
              title="Open full page preview"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Iframe Preview */}
        <div className="flex-1 bg-zinc-100 p-2 sm:p-4 overflow-hidden">
          <iframe
            src={`/api/groups/${group.id}/preview-email`}
            title="Email Template Preview"
            className="w-full h-full rounded-lg bg-white border border-zinc-200 shadow-sm"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-zinc-100 text-xs font-mono text-zinc-400 flex justify-between items-center">
          <span>99subcircle monochrome responsive template</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
