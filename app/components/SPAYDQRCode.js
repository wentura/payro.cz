"use client";

/**
 * SPAYD QR Code Component
 *
 * Generates and displays Czech banking QR code (SPAYD format)
 */

import { generateSPAYD } from "@/app/lib/spayd";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

export default function SPAYDQRCode({
  accountNumber,
  amount,
  currency = "CZK",
  message = "",
  variableSymbol = "",
  size = 200,
}) {
  const canvasRef = useRef(null);
  const [error, setError] = useState("");
  const [spaydString, setSpaydString] = useState("");

  useEffect(() => {
    if (!accountNumber) {
      setError("Číslo účtu není vyplněno");
      return;
    }

    try {
      // Generate SPAYD string
      const spayd = generateSPAYD({
        accountNumber,
        amount,
        currency,
        message,
        variableSymbol,
      });

      setSpaydString(spayd);

      // Generate QR code
      if (canvasRef.current) {
        QRCode.toCanvas(
          canvasRef.current,
          spayd,
          {
            width: size,
            margin: 1,
            errorCorrectionLevel: "M",
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          },
          (err) => {
            if (err) {
              console.error("QR Code error:", err);
              setError("Chyba při generování QR kódu");
            }
          }
        );
      }
    } catch (err) {
      console.error("SPAYD error:", err);
      setError(err.message || "Chyba při generování platebního QR kódu");
    }
  }, [accountNumber, amount, currency, message, variableSymbol, size]);

  if (!accountNumber) {
    return (
      <div className="text-center p-4 border border-gray-300 rounded">
        <p className="text-xs text-gray-600">
          Vyplňte číslo účtu v Nastavení pro zobrazení QR kódu
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 border border-red-300 bg-red-50 rounded">
        <p className="text-xs text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="text-center ">
      <canvas ref={canvasRef} className="mx-auto" />
      {/* <p className="text-xs text-black mt-2 font-mono break-all max-w-xs mx-auto">
        {spaydString}
      </p> */}
    </div>
  );
}
