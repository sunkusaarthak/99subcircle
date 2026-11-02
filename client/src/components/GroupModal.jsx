import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Users, Shield, Calendar } from 'lucide-react';

const PLATFORMS = ['YouTube Premium', 'Netflix', 'Amazon Prime', 'Spotify', 'ChatGPT Plus', 'Apple One', 'Disney+', 'Custom'];
const CURRENCIES = ['₹', '$', '€', '£', 'C$', 'A$'];

export default function GroupModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    platform: 'YouTube Premium',
    amount: 299,
    currency: '₹',
    billingDay: 5,
    adminName: '',
    adminEmail: '',
    paymentDetails: '',
    members: []
  });

  const [newMember, setNewMember] = useState({ name: '', email: '' });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        platform: initialData.platform || 'YouTube Premium',
        amount: initialData.amount || 299,
        currency: initialData.currency || '₹',
        billingDay: initialData.billingDay || 5,
        adminName: initialData.adminName || '',
        adminEmail: initialData.adminEmail || '',
        paymentDetails: initialData.paymentDetails || '',
        members: initialData.members ? [...initialData.members] : []
      });
    } else {
      setFormData({
        name: '',
        platform: 'YouTube Premium',
        amount: 299,
        currency: '₹',
        billingDay: 5,
        adminName: '',
        adminEmail: '',
        paymentDetails: 'UPI: yourname@upi or GPay: 9876543210',
        members: []
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.email.trim()) {
      alert('Please provide member name and email');
      return;
    }

    const memberObj = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: newMember.name.trim(),
      email: newMember.email.trim(),
      active: true,
      order: formData.members.length
    };

    setFormData(prev => ({
      ...prev,
      members: [...prev.members, memberObj]
    }));
    setNewMember({ name: '', email: '' });
  };

  const handleRemoveMember = (index) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, idx) => idx !== index)
    }));
  };

  const handleMoveMember = (index, direction) => {
    const newMembers = [...formData.members];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newMembers.length) return;
    const temp = newMembers[index];
    newMembers[index] = newMembers[targetIdx];
    newMembers[targetIdx] = temp;
    setFormData(prev => ({ ...prev, members: newMembers }));
  };

  const handleToggleMember = (index) => {
    const newMembers = [...formData.members];
    newMembers[index].active = !newMembers[index].active;
    setFormData(prev => ({ ...prev, members: newMembers }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.adminEmail.trim()) {
      alert('Please fill out Circle Name and Admin Email');
      return;
    }
    if (formData.members.length === 0) {
      if (!confirm('You have not added any circle members. Continue anyway?')) {
        return;
      }
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-zinc-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-950">
              {initialData ? 'Configure Subscription Circle' : 'Create Subscription Circle'}
            </h2>
            <p className="text-xs font-mono text-zinc-400">99subcircle membership & monthly rotation</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Basic Subscription Info */}
          <div className="space-y-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
              Service & Billing Parameters
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Circle Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. YouTube Premium Family"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Service / Platform</label>
                <select
                  value={formData.platform}
                  onChange={e => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-black bg-white transition"
                >
                  {PLATFORMS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-black bg-white transition"
                >
                  {CURRENCIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Monthly Total *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm font-mono border border-zinc-200 rounded-lg focus:outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Billing Day (1-31)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={formData.billingDay}
                  onChange={e => setFormData({ ...formData, billingDay: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 text-sm font-mono border border-zinc-200 rounded-lg focus:outline-none focus:border-black transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Admin & Payment Info */}
          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center">
              <Shield className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
              Circle Host & Payment Details
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Host Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarthak"
                  value={formData.adminName}
                  onChange={e => setFormData({ ...formData, adminName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Host Email * (Receives alerts)</label>
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={formData.adminEmail}
                  onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-mono border border-zinc-200 rounded-lg focus:outline-none focus:border-black transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Payment Instructions / UPI / Account (Included in emails)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. UPI to user@okhdfcbank or GPay +91 9876543210"
                value={formData.paymentDetails}
                onChange={e => setFormData({ ...formData, paymentDetails: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono border border-zinc-200 rounded-lg focus:outline-none focus:border-black transition"
              />
            </div>
          </div>

          {/* Section 3: Members & Rotation Sequence */}
          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center">
                <Users className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
                Circle Slots ({formData.members.length})
              </span>
              <span className="text-[11px] font-mono text-zinc-400">Order controls month-by-month rotation</span>
            </div>

            {/* Quick Add Member Form */}
            <div className="flex flex-col sm:flex-row gap-2 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
              <input
                type="text"
                placeholder="Member Name"
                value={newMember.name}
                onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                className="flex-1 px-3 py-1.5 text-sm border border-zinc-200 rounded-md focus:outline-none focus:border-black bg-white"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newMember.email}
                onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                className="flex-1 px-3 py-1.5 text-sm font-mono border border-zinc-200 rounded-md focus:outline-none focus:border-black bg-white"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-medium text-white bg-black hover:bg-zinc-800 rounded-md transition"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Slot
              </button>
            </div>

            {/* Members List with Reordering */}
            <div className="space-y-1.5">
              {formData.members.map((member, index) => (
                <div
                  key={member.id || index}
                  className="flex items-center justify-between p-2.5 bg-white border border-zinc-200 rounded-lg text-sm"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span className="w-5 h-5 rounded bg-zinc-100 flex items-center justify-center font-mono text-xs font-medium text-zinc-700 shrink-0">
                      {index + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-medium text-zinc-900 flex items-center gap-2 truncate">
                        <span className="truncate">{member.name}</span>
                        {!member.active && (
                          <span className="text-[10px] font-mono uppercase bg-zinc-100 text-zinc-500 px-1.5 py-0.2 rounded border border-zinc-200">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-zinc-400 truncate">{member.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleMember(index)}
                      className={`text-xs font-mono px-2 py-1 rounded transition ${
                        member.active ? 'text-zinc-500 hover:bg-zinc-100' : 'text-zinc-900 bg-zinc-100'
                      }`}
                    >
                      {member.active ? 'pause' : 'activate'}
                    </button>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveMember(index, -1)}
                      className="p-1 text-zinc-400 hover:text-black disabled:opacity-20 transition"
                      title="Move earlier in rotation"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === formData.members.length - 1}
                      onClick={() => handleMoveMember(index, 1)}
                      className="p-1 text-zinc-400 hover:text-black disabled:opacity-20 transition"
                      title="Move later in rotation"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(index)}
                      className="p-1 text-zinc-400 hover:text-black transition"
                      title="Remove slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-zinc-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-black hover:bg-zinc-800 rounded-lg shadow-sm transition"
            >
              {initialData ? 'Save Changes' : 'Create Circle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
