import React, { useState } from 'react';
import { 
  Users, Calendar, Send, SkipForward, Eye, Edit2, 
  Trash2, ShieldCheck, UserCheck, AlertCircle, ArrowRight
} from 'lucide-react';

export default function GroupCard({ 
  group, 
  onEdit, 
  onDelete, 
  onTriggerReminder, 
  onAdvanceRotation, 
  onSkipTurn, 
  onPreviewEmail 
}) {
  const [loadingAction, setLoadingAction] = useState(null);

  const activeMembers = (group.members || []).filter(m => m.active !== false);
  const payerIndex = (group.currentPayerIndex || 0) % (activeMembers.length || 1);
  const currentPayer = activeMembers[payerIndex] || null;
  const nextPayerIndex = (payerIndex + 1) % (activeMembers.length || 1);
  const nextPayer = activeMembers[nextPayerIndex] || null;

  const handleAction = async (actionName, fn) => {
    try {
      setLoadingAction(actionName);
      await fn();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-zinc-300 transition flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="p-5 border-b border-zinc-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50 text-zinc-800">
                {group.platform}
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                cycle: day {group.billingDay}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-zinc-950 tracking-tight">{group.name}</h3>
          </div>

          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-zinc-950 tracking-tight">
              {group.currency}{group.amount}
            </div>
            <div className="text-[11px] font-mono text-zinc-400">monthly pool</div>
          </div>
        </div>

        {/* Schedule & Admin Details Bar */}
        <div className="mt-4 pt-3 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>Due on the <strong>{group.billingDay}th</strong> of every month</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">Admin: <strong>{group.adminName}</strong> ({group.adminEmail})</span>
          </div>
        </div>

        {group.paymentDetails && (
          <div className="mt-3 text-xs font-mono bg-zinc-50 border border-zinc-200 text-zinc-700 px-3 py-2 rounded-lg break-all">
            <span className="text-zinc-400 uppercase text-[10px] block mb-0.5">Payment Routing:</span>
            {group.paymentDetails}
          </div>
        )}
      </div>

      {/* Main Body: Rotation Track */}
      <div className="p-5 flex-1 bg-zinc-50/40">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 flex items-center">
            <Users className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
            Rotation ({activeMembers.length} active)
          </span>

          {currentPayer && (
            <span className="font-mono text-[11px] text-zinc-500">
              slot {payerIndex + 1}/{activeMembers.length}
            </span>
          )}
        </div>

        {activeMembers.length === 0 ? (
          <div className="text-center py-6 text-zinc-400 text-xs font-mono">
            No active circle members. Add members to activate rotation.
          </div>
        ) : (
          <div className="space-y-1.5">
            {activeMembers.map((member, idx) => {
              const isCurrent = idx === payerIndex;
              const isNext = idx === nextPayerIndex && activeMembers.length > 1;

              return (
                <div
                  key={member.id || idx}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-sm transition ${
                    isCurrent
                      ? 'bg-black text-white border-black shadow-sm'
                      : isNext
                        ? 'bg-white text-zinc-900 border-zinc-200'
                        : 'bg-white/60 text-zinc-500 border-zinc-100'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span className={`w-5 h-5 rounded flex items-center justify-center font-mono text-xs font-medium shrink-0 ${
                      isCurrent
                        ? 'bg-white text-black'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-medium flex items-center gap-2 truncate">
                        <span className="truncate">{member.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-200">
                            Paying this month
                          </span>
                        )}
                        {isNext && (
                          <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                            Up Next
                          </span>
                        )}
                      </div>
                      <div className={`text-xs truncate font-mono ${isCurrent ? 'text-zinc-400' : 'text-zinc-400'}`}>
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-mono shrink-0 pl-2">
                    {isCurrent ? (
                      <span className="font-bold text-white">{group.currency}{group.amount}</span>
                    ) : (
                      <span className="text-zinc-400">queued</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3.5 bg-white border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5">
          {/* Send Reminder Button */}
          <button
            onClick={() => handleAction('send', () => onTriggerReminder(group.id))}
            disabled={loadingAction !== null || activeMembers.length === 0}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-black hover:bg-zinc-800 disabled:opacity-40 rounded-lg transition"
            title="Dispatch reminder to current payer & advance"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            <span>{loadingAction === 'send' ? 'Sending...' : 'Remind'}</span>
          </button>

          {/* Mark Paid / Advance Turn */}
          <button
            onClick={() => handleAction('advance', () => onAdvanceRotation(group.id))}
            disabled={loadingAction !== null || activeMembers.length === 0}
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-mono text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 disabled:opacity-40 rounded-lg transition"
            title="Mark as paid offline and move rotation to next person"
          >
            <UserCheck className="w-3.5 h-3.5 mr-1" />
            <span>Paid</span>
          </button>

          {/* Skip Turn */}
          <button
            onClick={() => handleAction('skip', () => onSkipTurn(group.id))}
            disabled={loadingAction !== null || activeMembers.length === 0}
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-mono text-zinc-500 hover:text-black hover:bg-zinc-100 disabled:opacity-40 rounded-lg transition"
            title="Skip current person's turn"
          >
            <SkipForward className="w-3.5 h-3.5 mr-1" />
            <span>Skip</span>
          </button>
        </div>

        <div className="flex items-center space-x-1">
          {/* Preview Email */}
          <button
            onClick={() => onPreviewEmail(group)}
            className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition"
            title="Preview email template"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Edit Group */}
          <button
            onClick={() => onEdit(group)}
            className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition"
            title="Edit circle & members"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete Group */}
          <button
            onClick={() => onDelete(group.id)}
            className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition"
            title="Delete circle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
