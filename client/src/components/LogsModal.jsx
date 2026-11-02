import React from 'react';
import { X, History, RefreshCw } from 'lucide-react';

export default function LogsModal({ isOpen, onClose, logs, onRefresh }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-black" />
            <div>
              <h3 className="text-sm font-semibold text-zinc-950">Dispatch Audit Logs</h3>
              <p className="text-xs font-mono text-zinc-400">99subcircle monthly billing notifications history</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-100 transition"
              title="Refresh logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 font-mono text-xs">
              <History className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
              <p>No dispatch logs recorded yet.</p>
              <p className="text-zinc-400 mt-1">Trigger a reminder on any circle to test.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-400 uppercase font-mono tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Circle</th>
                    <th className="py-2.5 px-3">Responsible Member</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Cycle</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {logs.map((log) => {
                    const isSuccess = log.status === 'SENT' || log.status === 'MOCK_SENT';
                    return (
                      <tr key={log.id} className="hover:bg-zinc-50 transition">
                        <td className="py-3 px-3 text-zinc-500 font-mono whitespace-nowrap">
                          {new Date(log.sentAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3 px-3 font-medium text-zinc-900 whitespace-nowrap">
                          {log.groupName}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-zinc-900">{log.payerName}</div>
                          <div className="text-zinc-400 font-mono">{log.payerEmail}</div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-zinc-950">
                          {log.currency}{log.amount}
                        </td>
                        <td className="py-3 px-3 text-zinc-600 whitespace-nowrap font-mono">
                          {log.cycleMonth}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-wider ${
                            log.status === 'SENT'
                              ? 'bg-black text-white'
                              : log.status === 'MOCK_SENT'
                                ? 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                                : 'bg-zinc-200 text-zinc-700'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-100 text-xs text-zinc-500 flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
