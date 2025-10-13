"use client";

/**
 * Print Button Component
 *
 * Triggers browser print dialog
 */

import { useEffect } from "react";

export default function PrintButton() {
  useEffect(() => {
    // Auto-focus on print button when page loads
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        window.print();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed top-4 right-4 print:hidden z-50">
      <button
        onClick={handlePrint}
        className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors"
      >
        🖨️ Tisknout / Uložit jako PDF
      </button>
    </div>
  );
}
