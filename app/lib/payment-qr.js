/**
 * Payment QR Code Generation
 * Generates SPAYD format for Czech payment QR codes
 *
 * SPAYD (Short Payment Descriptor) is the Czech standard for payment QR codes
 * Spec: https://qr-platba.cz/pro-vyvojare/specifikace-formatu/
 */

/**
 * Converts Czech bank account format to IBAN
 * @param {string} bankAccount - Format: "123456789/0800" or "000019-0000123456/0800" or IBAN
 * @returns {string|null} - IBAN format or null if conversion fails
 */
export function convertToIBAN(bankAccount) {
  if (!bankAccount) return null;

  // If already IBAN, return it (cleaned)
  if (bankAccount.startsWith("CZ")) {
    return bankAccount.replace(/\s/g, ""); // Remove spaces
  }

  // Parse Czech format: "prefix-account/bankCode" or "account/bankCode"
  const parts = bankAccount.trim().split("/");
  if (parts.length !== 2) {
    console.warn("Invalid bank account format:", bankAccount);
    return null;
  }

  const bankCode = parts[1].padStart(4, "0"); // Bank code (4 digits)
  const accountParts = parts[0].split("-");

  let prefix = "";
  let accountNumber = "";

  if (accountParts.length === 2) {
    // Format: prefix-account/bankCode
    prefix = accountParts[0].padStart(6, "0");
    accountNumber = accountParts[1].padStart(10, "0");
  } else {
    // Format: account/bankCode
    prefix = "000000";
    accountNumber = accountParts[0].padStart(10, "0");
  }

  // Build IBAN: CZ + checksum + bankCode + prefix + account
  // Calculate mod-97 checksum (IBAN standard)
  const bban = `${bankCode}${prefix}${accountNumber}`;
  const numericIBAN = `${bban}123500`; // CZ = 1235, 00 for checksum calculation

  // Calculate checksum
  let remainder = BigInt(numericIBAN) % 97n;
  const checksum = String(98 - Number(remainder)).padStart(2, "0");

  const iban = `CZ${checksum}${bban}`;

  console.log(`✓ Converted ${bankAccount} → ${iban}`);
  return iban;
}

/**
 * Formats amount for SPAYD (always 2 decimal places, dot separator)
 * @param {number|string} amount
 * @returns {string}
 */
export function formatAmountForSPAYD(amount) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num.toFixed(2);
}

/**
 * Formats date for SPAYD (YYYYMMDD)
 * @param {string|Date} date
 * @returns {string|null}
 */
export function formatDateForSPAYD(date) {
  if (!date) return null;

  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

/**
 * Generates SPAYD payment string for QR code
 * @param {Object} params - Payment parameters
 * @param {string} params.bankAccount - Bank account (IBAN or Czech format)
 * @param {number|string} params.amount - Payment amount
 * @param {string} params.currency - Currency code (CZK, EUR)
 * @param {string} params.variableSymbol - Variable symbol (invoice number)
 * @param {string} params.dueDate - Due date (optional)
 * @param {string} params.beneficiaryName - Beneficiary name (optional)
 * @param {string} params.message - Payment message (optional)
 * @returns {string} - SPAYD format string
 */
export function generateSPAYD({
  bankAccount,
  amount,
  currency = "CZK",
  variableSymbol,
  dueDate,
  beneficiaryName,
  message,
}) {
  // Start with SPAYD version
  const parts = ["SPD*1.0"];

  // Bank account (IBAN or account number)
  const iban = convertToIBAN(bankAccount);
  if (iban) {
    if (iban.startsWith("CZ")) {
      parts.push(`ACC:${iban}`);
    } else {
      // Czech format - use alternate field
      parts.push(`ACC:${iban}`);
    }
  }

  // Amount
  if (amount) {
    parts.push(`AM:${formatAmountForSPAYD(amount)}`);
  }

  // Currency
  if (currency) {
    parts.push(`CC:${currency}`);
  }

  // Variable symbol (invoice number)
  if (variableSymbol) {
    // Remove non-numeric characters from invoice number
    const vs = String(variableSymbol).replace(/[^0-9]/g, "");
    if (vs) {
      parts.push(`X-VS:${vs}`);
    }
  }

  // Due date
  if (dueDate) {
    const formattedDate = formatDateForSPAYD(dueDate);
    if (formattedDate) {
      parts.push(`DT:${formattedDate}`);
    }
  }

  // Beneficiary name
  if (beneficiaryName) {
    parts.push(`RN:${beneficiaryName}`);
  }

  // Message
  if (message) {
    // Encode message (remove special characters for simplicity)
    const cleanMessage = message.replace(/[*]/g, "");
    parts.push(`MSG:${cleanMessage}`);
  }

  return parts.join("*");
}

/**
 * Generates SPAYD string from invoice data
 * @param {Object} invoice - Invoice object
 * @param {Object} issuer - User/issuer object
 * @returns {string} - SPAYD format string
 */
export function generateInvoiceSPAYD(invoice, issuer) {
  return generateSPAYD({
    bankAccount: issuer?.bank_account,
    amount: invoice?.total_amount,
    currency: invoice?.currency || "CZK",
    variableSymbol: invoice?.invoice_number,
    dueDate: invoice?.due_date,
    beneficiaryName: issuer?.name,
    message: `Faktura ${invoice?.invoice_number || ""}`,
  });
}
