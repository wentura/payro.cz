"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

/**
 * PaymentQRCode Component
 *
 * Generates and displays a QR code for payment
 * Uses SPAYD format for Czech payments
 */
export default function PaymentQRCode({ spaydString, size = 200 }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!spaydString || !canvasRef.current) {
      return;
    }

    // Generate QR code on canvas
    QRCode.toCanvas(
      canvasRef.current,
      spaydString,
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
          console.error("QR Code generation error:", err);
          setError(err);
        }
      }
    );
  }, [spaydString, size]);

  if (!spaydString) {
    return null;
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">Chyba při generování QR kódu</div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} className="border-2 border-black" />
      <p className="text-xs text-black mt-1 text-center">
        Naskenujte pro platbu
      </p>
    </div>
  );
}
