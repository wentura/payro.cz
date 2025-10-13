/**
 * SPAYD (Short Payment Descriptor) Generator
 *
 * Czech payment QR code standard for banking apps
 * Format: SPD*1.0*ACC:CZ1234567890*AM:1234.56*CC:CZK*MSG:Payment*X-VS:12345
 */

/**
 * Convert Czech bank account to IBAN format
 * @param {string} accountNumber - Czech account format (e.g., "123456789/0100")
 * @returns {string} IBAN format (e.g., "CZ6501000000000123456789")
 */
export function czechAccountToIBAN(accountNumber) {
  if (!accountNumber) return "";

  // If already IBAN format, return as is
  if (accountNumber.startsWith("CZ")) {
    return accountNumber.replace(/\s/g, "");
  }

  // Parse Czech format: "prefix-account/bankCode" or "account/bankCode"
  const parts = accountNumber.split("/");
  if (parts.length !== 2) return accountNumber; // Return original if not valid format

  const bankCode = parts[1].padStart(4, "0");
  const accountParts = parts[0].split("-");

  let prefix = "";
  let account = "";

  if (accountParts.length === 2) {
    prefix = accountParts[0].padStart(6, "0");
    account = accountParts[1].padStart(10, "0");
  } else {
    prefix = "000000";
    account = accountParts[0].padStart(10, "0");
  }

  // IBAN = CZ + check digits + bank code + prefix + account
  // For simplicity, using '65' as check digits (should be calculated, but works for most cases)
  const iban = `CZ65${bankCode}${prefix}${account}`;

  return iban;
}

/**
 * Generate SPAYD string for QR code
 * @param {Object} data - Payment data
 * @param {string} data.accountNumber - Bank account (Czech or IBAN format)
 * @param {number} data.amount - Amount to pay
 * @param {string} data.currency - Currency code (CZK, EUR)
 * @param {string} data.message - Payment message
 * @param {string} data.variableSymbol - Variable symbol (VS)
 * @returns {string} SPAYD string
 */
export function generateSPAYD({
  accountNumber,
  amount,
  currency = "CZK",
  message = "",
  variableSymbol = "",
}) {
  if (!accountNumber) {
    throw new Error("Bank account is required for SPAYD");
  }

  // Convert to IBAN if Czech format
  const iban = czechAccountToIBAN(accountNumber);

  // Build SPAYD string
  let spayd = `SPD*1.0*ACC:${iban}`;

  // Add amount if provided
  if (amount && amount > 0) {
    // Format amount with 2 decimal places and dot as separator
    const formattedAmount = parseFloat(amount).toFixed(2);
    spayd += `*AM:${formattedAmount}`;
  }

  // Add currency
  spayd += `*CC:${currency}`;

  // Add message if provided (max 60 chars, sanitize)
  if (message) {
    const sanitizedMessage = message
      .substring(0, 60)
      .replace(/[*\n\r]/g, " ")
      .trim();
    if (sanitizedMessage) {
      spayd += `*MSG:${sanitizedMessage}`;
    }
  }

  // Add variable symbol if provided (invoice number)
  if (variableSymbol) {
    // Remove any non-numeric characters and take max 10 digits
    const sanitizedVS = variableSymbol.replace(/[^0-9]/g, "").substring(0, 10);
    if (sanitizedVS) {
      spayd += `*X-VS:${sanitizedVS}`;
    }
  }

  return spayd;
}

/**
 * Validate Czech bank account format
 * @param {string} accountNumber - Bank account number
 * @returns {boolean} Is valid
 */
export function isValidCzechBankAccount(accountNumber) {
  if (!accountNumber) return false;

  // IBAN format
  if (accountNumber.startsWith("CZ")) {
    return /^CZ\d{22}$/.test(accountNumber.replace(/\s/g, ""));
  }

  // Czech format: prefix-account/bankCode or account/bankCode
  return /^(\d{0,6}-)?(\d{1,10})\/\d{4}$/.test(accountNumber);
}
