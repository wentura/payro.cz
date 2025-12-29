/**
 * Get Reference Data
 *
 * Server-side functions to fetch reference data (dropdowns)
 * Uses Next.js cache for static reference data (units, payment types, due terms)
 */

import { unstable_cache } from "next/cache";
import { supabase } from "@/app/lib/supabase";

export async function getClients(userId) {
  try {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching clients:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getClients:", error);
    return [];
  }
}

async function _getDueTermsUncached() {
  try {
    const { data, error } = await supabase
      .from("due_terms")
      .select("*")
      .order("days_count", { ascending: true });

    if (error) {
      console.error("Error fetching due terms:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getDueTerms:", error);
    return [];
  }
}

// Cache due terms for 1 hour (3600 seconds)
// These are static reference data that rarely change
export const getDueTerms = unstable_cache(
  _getDueTermsUncached,
  ["due-terms"],
  {
    revalidate: 3600, // 1 hour
    tags: ["reference-data"],
  }
);

async function _getPaymentTypesUncached() {
  try {
    const { data, error } = await supabase
      .from("payment_types")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching payment types:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getPaymentTypes:", error);
    return [];
  }
}

// Cache payment types for 1 hour (3600 seconds)
// These are static reference data that rarely change
export const getPaymentTypes = unstable_cache(
  _getPaymentTypesUncached,
  ["payment-types"],
  {
    revalidate: 3600, // 1 hour
    tags: ["reference-data"],
  }
);

async function _getUnitsUncached() {
  try {
    const { data, error } = await supabase
      .from("units")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching units:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUnits:", error);
    return [];
  }
}

// Cache units for 1 hour (3600 seconds)
// These are static reference data that rarely change
export const getUnits = unstable_cache(
  _getUnitsUncached,
  ["units"],
  {
    revalidate: 3600, // 1 hour
    tags: ["reference-data"],
  }
);

