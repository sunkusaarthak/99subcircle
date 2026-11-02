import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GroupCard from './components/GroupCard';
import GroupModal from './components/GroupModal';
import EmailPreviewModal from './components/EmailPreviewModal';
import LogsModal from './components/LogsModal';
import TestEmailModal from './components/TestEmailModal';
import { api } from './api';
import { Users, Layers, Clock, Plus } from 'lucide-react';
import Logo from './components/Logo';

export default function App() {
  const [groups, setGroups] = useState([]);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewingGroup, setPreviewingGroup] = useState(null);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isTestEmailOpen, setIsTestEmailOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedGroups, fetchedLogs, fetchedStatus] = await Promise.all([
        api.getGroups(),
        api.getLogs(),
        api.getStatus().catch(() => null)
      ]);
      setGroups(fetchedGroups);
      setLogs(fetchedLogs);
      setStatus(fetchedStatus);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingGroup) {
        await api.updateGroup(editingGroup.id, formData);
        showToast(`Updated "${formData.name}".`);
      } else {
        await api.createGroup(formData);
        showToast(`Created "${formData.name}".`);
      }
      setIsGroupModalOpen(false);
      setEditingGroup(null);
      await loadData();
    } catch (err) {
      alert(`Error saving circle: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    const target = groups.find(g => g.id === id);
    if (!confirm(`Delete circle "${target?.name}"?`)) return;

    try {
      await api.deleteGroup(id);
      showToast('Circle removed.');
      await loadData();
    } catch (err) {
      alert(`Error deleting: ${err.message}`);
    }
  };

  const handleTriggerReminder = async (id) => {
    const res = await api.triggerReminder(id);
    showToast(`Reminder dispatched to ${res.payer}. Next: ${res.nextPayer}.`);
    await loadData();
  };

  const handleAdvanceRotation = async (id) => {
    const res = await api.advanceRotation(id);
    showToast(`Marked paid. Next: ${res.nextPayer?.name}.`);
    await loadData();
  };

  const handleSkipTurn = async (id) => {
    const res = await api.skipTurn(id);
    showToast(`Skipped. Now responsible: ${res.skippedTo?.name}.`);
    await loadData();
  };

  // Stats calculation
  const totalMembers = groups.reduce((acc, g) => acc + (g.members?.filter(m => m.active !== false)?.length || 0), 0);
  const totalMonthly = groups.reduce((acc, g) => acc + (parseFloat(g.amount) || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      <Navbar
        status={status}
        onNewGroup={() => { setEditingGroup(null); setIsGroupModalOpen(true); }}
        onOpenLogs={() => setIsLogsOpen(true)}
        onOpenTestEmail={() => setIsTestEmailOpen(true)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center space-x-2 px-3.5 py-2 rounded-lg shadow-xl text-xs font-mono bg-black text-white border border-zinc-800">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subtle Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Active Circles</div>
            <div className="text-2xl font-mono font-bold text-zinc-950">{groups.length}</div>
            <div className="text-[11px] font-mono text-zinc-400 mt-1">shared accounts</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Total Slots</div>
            <div className="text-2xl font-mono font-bold text-zinc-950">{totalMembers}</div>
            <div className="text-[11px] font-mono text-zinc-400 mt-1">active members</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Pooled Volume</div>
            <div className="text-2xl font-mono font-bold text-zinc-950">
              {groups[0]?.currency || '₹'}{totalMonthly.toFixed(2)}
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-1">monthly managed</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Auto Check</div>
            <div className="text-2xl font-mono font-bold text-zinc-950">09:00 UTC</div>
            <div className="text-[11px] font-mono text-zinc-400 mt-1">daily cron trigger</div>
          </div>
        </div>

        {/* Group Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-950 tracking-tight">Active Subscription Circles</h2>
              <p className="text-xs text-zinc-400">Rotating payment slots every monthly billing date</p>
            </div>

            <button
              onClick={() => { setEditingGroup(null); setIsGroupModalOpen(true); }}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-black hover:bg-zinc-800 rounded-lg shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Create Circle</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20 text-zinc-400">
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-mono">loading circles...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-zinc-300 p-12 text-center">
              <div className="w-12 h-12 bg-zinc-100 text-black rounded-xl flex items-center justify-center mx-auto mb-3">
                <Logo size={24} />
              </div>
              <h3 className="text-base font-semibold text-zinc-950 mb-1">No Circles Created Yet</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto mb-5">
                Register a family or friends group for YouTube, Netflix, Spotify, or Prime. 99subcircle will rotate payment responsibility and notify members on time.
              </p>
              <button
                onClick={() => { setEditingGroup(null); setIsGroupModalOpen(true); }}
                className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium text-white bg-black hover:bg-zinc-800 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Create Your First Circle</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onEdit={grp => { setEditingGroup(grp); setIsGroupModalOpen(true); }}
                  onDelete={handleDelete}
                  onTriggerReminder={handleTriggerReminder}
                  onAdvanceRotation={handleAdvanceRotation}
                  onSkipTurn={handleSkipTurn}
                  onPreviewEmail={grp => { setPreviewingGroup(grp); setIsPreviewOpen(true); }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-6 text-center text-xs font-mono text-zinc-400">
        <p>99subcircle • shared subscription circles & rotation</p>
      </footer>

      {/* Modals */}
      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => { setIsGroupModalOpen(false); setEditingGroup(null); }}
        onSave={handleCreateOrUpdate}
        initialData={editingGroup}
      />

      <EmailPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => { setIsPreviewOpen(false); setPreviewingGroup(null); }}
        group={previewingGroup}
      />

      <LogsModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        logs={logs}
        onRefresh={loadData}
      />

      <TestEmailModal
        isOpen={isTestEmailOpen}
        onClose={() => setIsTestEmailOpen(false)}
        status={status}
      />
    </div>
  );
}
