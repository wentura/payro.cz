/**
 * Authentication Functions
 *
 * Handles user authentication, session management, and password operations
 */

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { supabase } from "./supabase";

const SESSION_COOKIE_NAME = "payro_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "svoboda.zbynek@gmail.com";

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} Match result
 */
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Create a session for a user
 * @param {string} userId - User ID
 * @param {string} userEmail - User email (for admin verification)
 * @returns {Promise<void>}
 */
export async function createSession(userId, userEmail = null) {
  const cookieStore = await cookies();
  const isAdmin = userEmail === ADMIN_EMAIL;

  const sessionData = {
    userId,
    isAdmin,
    createdAt: Date.now(),
  };

  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: "/",
  });
}

/**
 * Get current session
 * @returns {Promise<Object|null>} Session data or null
 */
export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value);

    // Check if session is expired
    if (Date.now() - sessionData.createdAt > SESSION_DURATION) {
      // Session expired - just return null (can't delete cookie from Server Component)
      return null;
    }

    return sessionData;
  } catch (error) {
    // Invalid cookie format (e.g., JWT from another app) - just return null
    // Note: We can't delete the cookie here because this runs in a Server Component
    // The cookie will need to be cleared manually by the user or via a Route Handler
    return null;
  }
}

/**
 * Destroy current session
 * @returns {Promise<void>}
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get current user from session
 * @returns {Promise<Object|null>} User object or null
 */
export async function getCurrentUser() {
  const session = await getSession();

  if (!session || !session.userId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, name, company_id, contact_email, contact_phone, contact_website, bank_account, billing_details, default_settings, created_at, deactivated_at"
      )
      .eq("id", session.userId)
      .single();

    if (error || !data) {
      console.error("Error fetching user:", error);
      return null;
    }

    // Check if user is deactivated - auto-logout
    if (data.deactivated_at) {
      console.log("User is deactivated, returning null for auto-logout");
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

/**
 * Check if current user is admin (from session cookie)
 * @returns {Promise<boolean>} True if user is admin
 */
export async function isCurrentUserAdmin() {
  const session = await getSession();
  return session?.isAdmin === true;
}

/**
 * Require authentication - throws if not authenticated
 * @returns {Promise<Object>} User object
 * @throws {Error} If not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Result object with success/error
 */
/**
 * Create email verification token
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Token object with token and expires_at
 */
export async function createEmailVerificationToken(userId) {
  try {
    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Delete any existing tokens for this user
    await supabase
      .from("email_verification_tokens")
      .delete()
      .eq("user_id", userId);

    // Create new token
    const { error: tokenError } = await supabase
      .from("email_verification_tokens")
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error("Error creating verification token:", tokenError);
      return {
        success: false,
        error: "Chyba při vytváření verifikačního tokenu",
      };
    }

    return {
      success: true,
      token,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    console.error("Error in createEmailVerificationToken:", error);
    return {
      success: false,
      error: "Neočekávaná chyba při vytváření tokenu",
    };
  }
}

/**
 * Verify email verification token
 * @param {string} token - Verification token
 * @returns {Promise<Object>} Result with user_id if valid
 */
export async function verifyEmailToken(token) {
  try {
    const { data: tokenData, error } = await supabase
      .from("email_verification_tokens")
      .select("user_id, expires_at")
      .eq("token", token)
      .single();

    if (error || !tokenData) {
      return {
        success: false,
        error: "Neplatný nebo neexistující token",
      };
    }

    // Check if token is expired
    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      return {
        success: false,
        error: "Token vypršel. Požádejte o nový aktivační email.",
      };
    }

    return {
      success: true,
      userId: tokenData.user_id,
    };
  } catch (error) {
    console.error("Error in verifyEmailToken:", error);
    return {
      success: false,
      error: "Neočekávaná chyba při ověřování tokenu",
    };
  }
}

export async function registerUser(userData) {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("contact_email", userData.contact_email)
      .single();

    if (existingUser) {
      return {
        success: false,
        error: "Uživatel s tímto emailem již existuje",
      };
    }

    // Hash password
    const passwordHash = await hashPassword(userData.password);

    // Create user (activated_at will be NULL by default)
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        name: userData.name,
        contact_email: userData.contact_email,
        password_hash: passwordHash,
        company_id: userData.company_id || null,
        activated_at: null, // Explicitly set to NULL
        billing_details: {
          street: "",
          house_number: "",
          city: "",
          zip: "",
          country: "Česká republika",
        },
      })
      .select()
      .single();

    if (error || !newUser) {
      console.error("Error creating user:", error);
      return {
        success: false,
        error: "Chyba při vytváření účtu",
      };
    }

    // Create verification token
    const tokenResult = await createEmailVerificationToken(newUser.id);

    if (!tokenResult.success) {
      // User was created but token creation failed
      // We should still return success but log the error
      console.error("Error creating verification token:", tokenResult.error);
      return {
        success: true,
        user: newUser,
        token: null, // Indicate token creation failed
        warning: "Účet byl vytvořen, ale aktivační email se nepodařilo odeslat. Kontaktujte podporu.",
      };
    }

    // Return user and token (email will be sent by API route)
    return {
      success: true,
      user: newUser,
      token: tokenResult.token,
    };
  } catch (error) {
    console.error("Error in registerUser:", error);
    return {
      success: false,
      error: "Neočekávaná chyba při registraci",
    };
  }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Result object with success/error
 */
export async function loginUser(email, password) {
  try {
    console.log("🔍 Looking up user:", email);

    // Find user by email (include activated_at and deactivated_at)
    const { data: user, error } = await supabase
      .from("users")
      .select("id, password_hash, name, contact_email, activated_at, deactivated_at")
      .eq("contact_email", email)
      .single();

    if (error) {
      console.error("❌ Database error finding user:", error);
      return {
        success: false,
        error: "Neplatný email nebo heslo",
      };
    }

    if (!user) {
      console.log("❌ User not found");
      return {
        success: false,
        error: "Neplatný email nebo heslo",
      };
    }

    console.log("✓ User found:", user.contact_email);

    // Verify password
    console.log("🔐 Verifying password...");
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      console.log("❌ Invalid password");
      return {
        success: false,
        error: "Neplatný email nebo heslo",
      };
    }

    console.log("✓ Password valid");

    // Check if account is activated
    if (!user.activated_at) {
      console.log("❌ Account not activated");
      return {
        success: false,
        error: "ACCOUNT_NOT_ACTIVATED", // Special error code
        message: "Účet není aktivován. Zkontrolujte svůj email nebo znovu pošlete aktivační email.",
      };
    }

    // Check if account is deactivated
    if (user.deactivated_at) {
      console.log("❌ Account is deactivated");
      return {
        success: false,
        error: "ACCOUNT_DEACTIVATED", // Special error code
        message: "Váš účet byl deaktivován. Kontaktujte administrátora.",
      };
    }

    // Update last login
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    // Create session
    console.log("🍪 Creating session...");
    await createSession(user.id, user.contact_email);
    console.log("✓ Session created");

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        contact_email: user.contact_email,
      },
    };
  } catch (error) {
    console.error("❌ Error in loginUser:", error);
    return {
      success: false,
      error: "Neočekávaná chyba při přihlašování",
    };
  }
}

/**
 * Logout user
 * @returns {Promise<void>}
 */
export async function logoutUser() {
  await destroySession();
}
