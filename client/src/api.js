const API_BASE = '/api';

export const api = {
  async getGroups() {
    const res = await fetch(`${API_BASE}/groups`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch groups');
    return json.data;
  },

  async getGroup(id) {
    const res = await fetch(`${API_BASE}/groups/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch group');
    return json.data;
  },

  async createGroup(data) {
    const res = await fetch(`${API_BASE}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create group');
    return json.data;
  },

  async updateGroup(id, data) {
    const res = await fetch(`${API_BASE}/groups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update group');
    return json.data;
  },

  async deleteGroup(id) {
    const res = await fetch(`${API_BASE}/groups/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete group');
    return true;
  },

  async triggerReminder(id) {
    const res = await fetch(`${API_BASE}/groups/${id}/trigger`, {
      method: 'POST'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to trigger reminder');
    return json.data;
  },

  async advanceRotation(id) {
    const res = await fetch(`${API_BASE}/groups/${id}/advance`, {
      method: 'POST'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to advance rotation');
    return json.data;
  },

  async skipTurn(id) {
    const res = await fetch(`${API_BASE}/groups/${id}/skip`, {
      method: 'POST'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to skip turn');
    return json.data;
  },

  async getLogs(groupId = null) {
    const url = groupId ? `${API_BASE}/logs?groupId=${groupId}` : `${API_BASE}/logs`;
    const res = await fetch(url);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch logs');
    return json.data;
  },

  async getStatus() {
    const res = await fetch(`${API_BASE}/status`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch status');
    return json;
  },

  async sendTestEmail(to) {
    const res = await fetch(`${API_BASE}/test-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to send test email');
    return json.data;
  }
};

