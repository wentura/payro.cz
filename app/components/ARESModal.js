"use client";

/**
 * ARES Modal Component
 *
 * Modal for searching company data in ARES (Administrativní registr ekonomických subjektů)
 * and filling the form with retrieved data
 */

import { useState } from "react";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Input from "./ui/Input";

export default function ARESModal({ isOpen, onClose, onSelectCompany }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Zadejte IČO společnosti");
      return;
    }

    setIsLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await fetch("/api/ares/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchTerm }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Chyba při vyhledávání v ARES");
      }

      setResults(data.results || []);
    } catch (err) {
      console.error("ARES search error:", err);
      setError(err.message || "Chyba při vyhledávání v ARES");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCompany = (company) => {
    onSelectCompany(company);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatAddress = (address) => {
    if (!address) return "";
    const parts = [
      address.street,
      address.houseNumber,
      address.city,
      address.zip,
      address.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0 bg-neutral-800/50 bg-opacity-25">
        {/* Background overlay */}
        {/* <div
          className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity pointer-events-none"
          aria-hidden="true"
        /> */}

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-2xl">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Vyhledat v ARES
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Zavřít</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IČO společnosti
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="12345678"
                  disabled={isLoading}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />

                <button
                  onClick={handleSearch}
                  disabled={isLoading || !searchTerm.trim()}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Vyhledávání..." : "Vyhledat"}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Results */}
              {results.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Nalezené společnosti ({results.length})
                  </h3>

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {results.map((company, index) => (
                      <Card
                        key={index}
                        className="p-4 cursor-pointer hover:bg-gray-50"
                      >
                        <div onClick={() => handleSelectCompany(company)}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {company.obchodniJmeno || company.name}
                              </h4>

                              {company.ico && (
                                <p className="text-sm text-gray-600 mt-1">
                                  IČO: {company.ico}
                                </p>
                              )}

                              {company.dic && (
                                <p className="text-sm text-gray-600">
                                  DIČ: {company.dic}
                                </p>
                              )}

                              {company.address && (
                                <p className="text-sm text-gray-500 mt-2">
                                  {formatAddress(company.address)}
                                </p>
                              )}

                              {company.pravniForma && (
                                <p className="text-sm text-gray-500">
                                  {company.pravniForma}
                                </p>
                              )}
                            </div>

                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCompany(company);
                              }}
                            >
                              Vybrat
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {results.length === 0 && !isLoading && !error && searchTerm && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Žádné výsledky nenalezeny</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
