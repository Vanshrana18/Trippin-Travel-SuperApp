/**
 * Format a number as a currency string.
 * @param {number} value - The numerical value to format.
 * @param {string} currency - The currency code (e.g. 'USD'). Default is 'USD'.
 * @returns {string} - Formatted currency string.
 */
export const formatCurrency = (value, currency = 'USD') => {
  if (value === undefined || value === null || isNaN(value)) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format a date string or Date object into a readable format.
 * e.g., "Sep 1, 2025"
 * @param {string|Date} date - The date to format.
 * @returns {string} - Formatted date string, or empty string if invalid.
 */
export const formatDate = (date) => {
  if (!date) return '';
  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) return '';
  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
