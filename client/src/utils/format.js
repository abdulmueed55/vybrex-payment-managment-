export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return currency === 'PKR' ? 'Rs 0' : '$0';
  if (currency === 'PKR') {
    return 'Rs ' + new Intl.NumberFormat('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
};

export const formatPKR = (amount) => formatCurrency(amount, 'PKR');
export const formatUSD = (amount) => formatCurrency(amount, 'USD');

export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

export const formatMonthYear = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const daysUntil = (date) => {
  if (!date) return null;
  return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
};

export const daysSince = (date) => {
  if (!date) return null;
  return Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
};
