/**
 * Utility Functions
 *
 * Collection of helper functions for the application
 */

import { format, parseISO } from "date-fns";
import { cs } from "date-fns/locale";

/**
 * Format date in Czech format (DD.MM.YYYY)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDateCZ(date) {
  if (!date) return "";
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "dd.MM.yyyy");
}

/**
 * Format currency in Czech format
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: CZK)
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount, currency = "CZK") {
  if (amount === null || amount === undefined) return "0 Kč";

  const formatted = new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return currency === "CZK" ? `${formatted} Kč` : `${formatted} ${currency}`;
}

/**
 * Format number in Czech format
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number
 */
export function formatNumber(number, decimals = 2) {
  if (number === null || number === undefined) return "0";

  return new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
}

/**
 * Generate invoice number
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @param {number} sequence - Sequence number
 * @returns {string} Invoice number (YYYY-MM-NNN)
 */
export function generateInvoiceNumber(year, month, sequence) {
  return `${year}-${String(month).padStart(2, "0")}-${String(sequence).padStart(
    3,
    "0"
  )}`;
}

/**
 * Validate Czech company ID (IČO)
 * @param {string} ico - Company ID
 * @returns {boolean} Is valid
 */
export function validateICO(ico) {
  if (!ico || ico.length !== 8) return false;

  const digits = ico.split("").map(Number);
  if (digits.some(isNaN)) return false;

  // Czech IČO validation algorithm
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += digits[i] * (8 - i);
  }

  const remainder = sum % 11;
  const checkDigit = remainder === 0 ? 1 : remainder === 1 ? 0 : 11 - remainder;

  return checkDigit === digits[7];
}

/**
 * Calculate due date from issue date and due term
 * @param {Date|string} issueDate - Issue date
 * @param {number} daysCount - Number of days
 * @returns {Date} Due date
 */
export function calculateDueDate(issueDate, daysCount) {
  const date =
    typeof issueDate === "string" ? parseISO(issueDate) : new Date(issueDate);
  date.setDate(date.getDate() + daysCount);
  return date;
}

/**
 * Check if invoice is overdue
 * @param {Date|string} dueDate - Due date
 * @param {boolean} isPaid - Is invoice paid
 * @returns {boolean} Is overdue
 */
export function isInvoiceOverdue(dueDate, isPaid) {
  if (isPaid || !dueDate) return false;

  const due = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
  return due < new Date();
}

/**
 * Calculate total from invoice items
 * @param {Array} items - Invoice items
 * @returns {number} Total amount
 */
export function calculateInvoiceTotal(items) {
  if (!items || items.length === 0) return 0;

  return items.reduce((total, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    return total + quantity * unitPrice;
  }, 0);
}

/**
 * Safe JSON parse
 * @param {string} json - JSON string
 * @param {*} defaultValue - Default value if parse fails
 * @returns {*} Parsed value or default
 */
export function safeJsonParse(json, defaultValue = null) {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

/**
 * Generate a simple hash for client-side IDs
 * @returns {string} Random hash
 */
export function generateHash() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
