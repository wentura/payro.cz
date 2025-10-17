/**
 * Variable Symbol Utilities
 *
 * Functions for generating and managing variable symbols for bank transfers
 */

/**
 * Generate a random 6-digit variable symbol (not starting with 0)
 * Format: 1-999999 (6 digits, first digit 1-9)
 *
 * @returns {string} 6-digit variable symbol
 */
export function generateVariableSymbol() {
  // First digit: 1-9 (not 0)
  const firstDigit = Math.floor(Math.random() * 9) + 1;

  // Remaining 5 digits: 0-9
  const remainingDigits = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");

  return `${firstDigit}${remainingDigits}`;
}

/**
 * Validate variable symbol format
 *
 * @param {string} symbol - Variable symbol to validate
 * @returns {boolean} True if valid format
 */
export function validateVariableSymbol(symbol) {
  // Must be exactly 6 digits, first digit 1-9
  const regex = /^[1-9][0-9]{5}$/;
  return regex.test(symbol);
}

/**
 * Generate unique variable symbol by checking database
 * This would be used in API endpoints to ensure uniqueness
 *
 * @param {object} supabase - Supabase client
 * @returns {Promise<string>} Unique variable symbol
 */
export async function generateUniqueVariableSymbol(supabase) {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const symbol = generateVariableSymbol();

    // Check if symbol already exists in database
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("id")
      .eq("variable_symbol", symbol)
      .single();

    // If no record found (error means no match), symbol is unique
    if (error && error.code === "PGRST116") {
      return symbol;
    }

    attempts++;
  }

  throw new Error(
    `Unable to generate unique variable symbol after ${maxAttempts} attempts`
  );
}
