/**
 * Pure domain logic for circle member rotation and cycle calculations.
 */

function getCycleMonthName(date = new Date()) {
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function getYearMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatDueDate(billingDay, date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const due = new Date(year, month, billingDay);
  return due.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getActiveMembers(group) {
  return (group.members || []).filter(m => m.active !== false);
}

function getCurrentAndNextPayer(group) {
  const activeMembers = getActiveMembers(group);
  if (activeMembers.length === 0) {
    return { activeMembers: [], payer: null, nextPayer: null, currentIndex: 0, nextIndex: 0 };
  }

  const currentIndex = (group.currentPayerIndex || 0) % activeMembers.length;
  const nextIndex = (currentIndex + 1) % activeMembers.length;

  return {
    activeMembers,
    payer: activeMembers[currentIndex],
    nextPayer: activeMembers[nextIndex],
    currentIndex,
    nextIndex
  };
}

module.exports = {
  getCycleMonthName,
  getYearMonthKey,
  formatDueDate,
  getActiveMembers,
  getCurrentAndNextPayer
};
