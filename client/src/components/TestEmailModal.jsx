import React, { useState } from 'react';
import { X, Send, AlertCircle, Check } from 'lucide-react';
import { api } from '../api';

export default function TestEmailModal({ isOpen, onClose, status }) {
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!recipient.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const res = await api.sendTestEmail(recipient.trim());
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isMock = status?.email?.mode === 'mock';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-zinc-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-950">Test Email Dispatch</h3>
            <p className="text-xs font-mono text-zinc-400">Verify 99subcircle SMTP delivery</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isMock && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono text-zinc-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <div>
                <strong>Mock Mode Active:</strong> SMTP credentials not configured yet. Test message will be printed to server logs.
              </div>
            </div>
          )}

          <form onSubmit={handleSendTest} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-zinc-200 rounded-lg focus:outline-none focus:border-black transition"
              />
            </div>

            {result && (
              <div className="p-3 bg-zinc-50 border border-zinc-300 rounded-lg text-xs font-mono text-zinc-900 flex items-start space-x-2">
                <Check className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <div>
                  <strong>Success:</strong> {result.mock ? 'Mock email dispatched to terminal.' : 'Real email dispatched to inbox.'}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-zinc-100 border border-zinc-300 rounded-lg text-xs font-mono text-zinc-900 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Error:</strong> {error}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg transition"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-1.5 text-xs font-medium text-white bg-black hover:bg-zinc-800 disabled:opacity-40 rounded-lg transition"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                <span>{loading ? 'Sending...' : 'Send'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
