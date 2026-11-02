const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');
const filePath = path.join(dataDir, 'database.json');

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    const seedData = {
      groups: [
        {
          id: 'grp_youtube_demo',
          name: 'Family YouTube Premium',
          platform: 'YouTube',
          amount: 299,
          currency: '₹',
          billingDay: 5,
          adminName: 'Sarthak (Admin)',
          adminEmail: 'admin@example.com',
          paymentDetails: 'UPI ID: admin@okhdfcbank or GPay to +91 9876543210',
          members: [
            { id: 'mem_1', name: 'Alex Johnson', email: 'alex@example.com', active: true, order: 0 },
            { id: 'mem_2', name: 'Priya Sharma', email: 'priya@example.com', active: true, order: 1 },
            { id: 'mem_3', name: 'David Miller', email: 'david@example.com', active: true, order: 2 },
            { id: 'mem_4', name: 'Ananya Patel', email: 'ananya@example.com', active: true, order: 3 }
          ],
          currentPayerIndex: 0,
          lastBilledDate: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      logs: []
    };
    fs.writeFileSync(filePath, JSON.stringify(seedData, null, 2), 'utf-8');
  }
}

function readData() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading JSON store:', err);
    return { groups: [], logs: [] };
  }
}

function writeData(data) {
  ensureDataFile();
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, filePath);
}

const jsonStore = {
  async getGroups() {
    const data = readData();
    return data.groups;
  },

  async getGroupById(id) {
    const data = readData();
    return data.groups.find(g => g.id === id) || null;
  },

  async createGroup(groupData) {
    const data = readData();
    const newGroup = {
      ...groupData,
      id: groupData.id || `grp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.groups.push(newGroup);
    writeData(data);
    return newGroup;
  },

  async updateGroup(id, updates) {
    const data = readData();
    const index = data.groups.findIndex(g => g.id === id);
    if (index === -1) return null;

    data.groups[index] = {
      ...data.groups[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    writeData(data);
    return data.groups[index];
  },

  async deleteGroup(id) {
    const data = readData();
    const initialLen = data.groups.length;
    data.groups = data.groups.filter(g => g.id !== id);
    data.logs = data.logs.filter(l => l.groupId !== id);
    writeData(data);
    return data.groups.length < initialLen;
  },

  async addLog(logData) {
    const data = readData();
    const newLog = {
      ...logData,
      id: logData.id || `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      sentAt: new Date().toISOString()
    };
    data.logs.unshift(newLog); // latest first
    // keep up to 200 logs
    if (data.logs.length > 200) data.logs = data.logs.slice(0, 200);
    writeData(data);
    return newLog;
  },

  async getLogs(groupId = null) {
    const data = readData();
    if (groupId) {
      return data.logs.filter(l => l.groupId === groupId);
    }
    return data.logs;
  }
};

module.exports = jsonStore;

