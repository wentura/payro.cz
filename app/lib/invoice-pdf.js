/**
 * Invoice PDF generation (server-only)
 *
 * Uses @react-pdf/renderer with Czech-capable Roboto fonts.
 */

import "server-only";
import { createElement } from "react";
import { Font, renderToBuffer } from "@react-pdf/renderer";
import path from "path";
import QRCode from "qrcode";
import { generateInvoiceSPAYD } from "@/app/lib/payment-qr";
import { formatCurrency, formatDateCZ, formatNumber } from "@/app/lib/utils";
import InvoicePdfDocument from "@/app/lib/pdf/InvoicePdfDocument.jsx";

let fontsRegistered = false;

function registerFonts() {
  if (fontsRegistered) return;

  const fontsDir = path.join(process.cwd(), "public", "fonts");

  Font.register({
    family: "Roboto",
    fonts: [
      {
        src: path.join(fontsDir, "Roboto-Regular.ttf"),
        fontWeight: 400,
      },
      {
        src: path.join(fontsDir, "Roboto-Bold.ttf"),
        fontWeight: 700,
      },
    ],
  });

  fontsRegistered = true;
}

async function buildQrDataUrl(invoice, issuer) {
  if (!issuer?.bank_account || !invoice?.total_amount) {
    return null;
  }

  const spayd = generateInvoiceSPAYD(invoice, issuer);
  if (!spayd || !spayd.includes("ACC:")) {
    return null;
  }

  try {
    return await QRCode.toDataURL(spayd, {
      width: 180,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#ffffff" },
    });
  } catch (error) {
    console.error("Error generating QR for PDF:", error);
    return null;
  }
}

/**
 * Build a unit id -> unit lookup map
 * @param {Array} units
 * @returns {Object}
 */
export function buildUnitLookup(units = []) {
  return (units || []).reduce((acc, unit) => {
    acc[unit.id] = unit;
    return acc;
  }, {});
}

/**
 * Generate invoice PDF as a Buffer
 * @param {Object} options
 * @param {Object} options.invoice - Invoice with items and clients
 * @param {Object} options.issuer - User/issuer (public columns)
 * @param {Array|Object} options.units - Units array or lookup map
 * @returns {Promise<Buffer>}
 */
export async function generateInvoicePdfBuffer({
  invoice,
  issuer,
  units = [],
}) {
  registerFonts();

  const unitLookup = Array.isArray(units)
    ? buildUnitLookup(units)
    : units || {};

  const qrDataUrl = await buildQrDataUrl(invoice, issuer);

  const labels = {
    issueDate: formatDateCZ(invoice.issue_date) || "-",
    dueDate: formatDateCZ(invoice.due_date) || "-",
    paymentDate: formatDateCZ(invoice.payment_date) || "-",
    formatCurrency,
    formatNumber,
  };

  const document = createElement(InvoicePdfDocument, {
    invoice,
    issuer,
    unitLookup,
    qrDataUrl,
    labels,
  });

  return renderToBuffer(document);
}

/**
 * Safe PDF filename for Content-Disposition / Resend
 * @param {string|null} invoiceNumber
 * @returns {string}
 */
export function getInvoicePdfFilename(invoiceNumber) {
  const safe = (invoiceNumber || "koncept")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");
  return `Faktura-${safe}.pdf`;
}
