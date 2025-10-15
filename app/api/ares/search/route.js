/**
 * ARES Search API Endpoint
 *
 * Searches for company data in ARES (Administrativní registr ekonomických subjektů)
 * Based on ARES API documentation from MF ČR
 */

import { NextResponse } from "next/server";

const ARES_BASE_URL = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest";

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Clean the query - remove spaces and special characters for IČO
    const cleanQuery = query.trim();

    // Determine if it's an IČO (8 digits) or company name
    const isICO = /^\d{8}$/.test(cleanQuery);

    let searchUrl;
    let params;

    if (isICO) {
      // Search by IČO - direct lookup
      searchUrl = `${ARES_BASE_URL}/ekonomicke-subjekty/${cleanQuery}`;
      params = null;
    } else {
      // Search by company name - use POST with JSON body
      searchUrl = `${ARES_BASE_URL}/ekonomicke-subjekty/vyhledat`;
      params = null; // Will use JSON body instead
    }

    let response;
    
    if (isICO) {
      // GET request for IČO lookup
      response = await fetch(searchUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "Payro.cz/1.0",
        },
      });
    } else {
      // POST request for company name search
      response = await fetch(searchUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Payro.cz/1.0",
        },
        body: JSON.stringify({
          obchodniJmeno: cleanQuery,
          stavZaznamu: "AKTIVNI",
          stranka: 1,
          velikostStranky: 20,
        }),
      });
    }

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ results: [] });
      }
      throw new Error(`ARES API error: ${response.status}`);
    }

    const data = await response.json();
    const results = processARESResponse(data, isICO);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("ARES search error:", error);

    return NextResponse.json(
      { error: "Chyba při vyhledávání v ARES. Zkuste to prosím později." },
      { status: 500 }
    );
  }
}

/**
 * Process ARES API response and normalize data structure
 */
function processARESResponse(data, isICO) {
  if (!data) return [];

  try {
    if (isICO) {
      // Single company result - direct IČO lookup
      return [normalizeCompanyData(data)];
    } else {
      // Multiple companies result - search by name
      const companies = data._embedded?.ekonomickeSubjekty || [];
      return companies.map(normalizeCompanyData);
    }
  } catch (error) {
    console.error("Error processing ARES response:", error);
    return [];
  }
}

/**
 * Normalize company data from ARES response to our format
 */
function normalizeCompanyData(company) {
  if (!company) return null;

  // Extract basic information
  const basicInfo = company.obchodniJmeno || company.nazev || "";
  const ico = company.ico || company.identifikacniCislo || "";
  const dic = company.dic || "";
  
  // Extract address information - ARES API v3 structure
  const adresa = company.sidlo || company.adresa || {};
  const address = {
    street: adresa.nazevUlice || adresa.ulice || "",
    houseNumber: adresa.cisloDomovni || adresa.cisloOrientacni || adresa.cisloPopisne || "",
    city: adresa.nazevObce || adresa.obec || "",
    zip: adresa.psc || "",
    country: "Česká republika",
  };

  // Extract legal form
  const pravniForma = company.pravniForma || company.forma || "";

  // Extract contact information
  const contact = {
    email: company.email || "",
    phone: company.telefon || company.telefonniCislo || "",
  };

  return {
    name: basicInfo,
    company_id: ico,
    dic: dic,
    address: address,
    pravniForma: pravniForma,
    contact_email: contact.email,
    contact_phone: contact.phone,
    // Keep original data for reference
    original: company,
  };
}
