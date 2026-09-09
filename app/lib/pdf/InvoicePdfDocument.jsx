/**
 * Invoice PDF Document
 *
 * Server-side React-PDF layout matching the print page.
 * Requires Czech-capable fonts registered by invoice-pdf.js.
 */

import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 36,
    fontFamily: "Roboto",
    fontSize: 9,
    color: "#374151",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#9ca3af",
    paddingBottom: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: "Roboto",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  issuerName: {
    fontSize: 11,
    fontWeight: 700,
  },
  parties: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 16,
  },
  partyCol: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottomWidth: 1,
    borderBottomColor: "#9ca3af",
    paddingBottom: 3,
    marginBottom: 6,
  },
  partyName: {
    fontWeight: 700,
    marginBottom: 2,
  },
  line: {
    marginBottom: 1,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderBottomWidth: 1,
    borderBottomColor: "#9ca3af",
    paddingBottom: 8,
    marginBottom: 12,
  },
  metaItem: {
    width: "33%",
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#9ca3af",
    paddingBottom: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#9ca3af",
    paddingVertical: 4,
  },
  colDesc: { flex: 2.2, paddingRight: 4 },
  colQty: { width: 54, textAlign: "right", paddingRight: 4 },
  colUnit: { width: 36, textAlign: "center" },
  colPrice: { width: 70, textAlign: "right", paddingRight: 4 },
  colTotal: { width: 70, textAlign: "right" },
  th: {
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  totalRow: {
    flexDirection: "row",
    borderTopWidth: 2,
    borderTopColor: "#9ca3af",
    paddingTop: 6,
    marginTop: 2,
  },
  totalLabel: {
    flex: 1,
    textAlign: "right",
    fontWeight: 700,
    fontSize: 10,
    textTransform: "uppercase",
    paddingRight: 8,
  },
  totalAmount: {
    width: 90,
    textAlign: "right",
    fontWeight: 700,
    fontSize: 12,
  },
  note: {
    marginTop: 12,
    marginBottom: 8,
  },
  noteText: {
    lineHeight: 1.4,
  },
  payment: {
    flexDirection: "row",
    marginTop: 12,
    gap: 16,
  },
  paymentDetails: {
    flex: 1,
  },
  qrWrap: {
    width: 100,
    alignItems: "flex-end",
  },
  qr: {
    width: 90,
    height: 90,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: "#9ca3af",
    paddingTop: 6,
    textAlign: "center",
    fontSize: 8,
  },
});

function parseJsonField(value) {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return JSON.parse(value) || {};
    } catch {
      return {};
    }
  }
  return value;
}

function paymentTypeName(paymentTypeId) {
  const types = {
    1: "Bankovní převod",
    2: "Hotovost",
    3: "Kreditní karta",
    4: "Jiný",
  };
  return types[paymentTypeId] || "-";
}

/**
 * @param {Object} props
 * @param {Object} props.invoice
 * @param {Object} props.issuer
 * @param {Object} props.unitLookup
 * @param {string|null} props.qrDataUrl
 * @param {Object} props.labels - preformatted Czech strings
 */
export default function InvoicePdfDocument({
  invoice,
  issuer,
  unitLookup = {},
  qrDataUrl = null,
  labels,
}) {
  const issuerBilling = parseJsonField(issuer?.billing_details);
  const clientAddress = parseJsonField(invoice.clients?.address);
  const items = invoice.items || [];

  const showUnitPriceColumn = items.some((item) => {
    const n = Number(item.unit_price);
    return (
      item.unit_price !== null &&
      item.unit_price !== undefined &&
      item.unit_price !== "" &&
      !Number.isNaN(n) &&
      n !== 0
    );
  });

  const showQuantityColumn = items.some((item) => {
    const quantity =
      item.quantity !== null && item.quantity !== undefined
        ? Number(item.quantity)
        : null;
    return quantity !== null && !Number.isNaN(quantity) && quantity !== 1;
  });

  const showUnitColumn = items.some((item) => {
    if (!item.unit_id) return false;
    return Boolean(unitLookup[item.unit_id]?.abbreviation);
  });

  const vs =
    invoice.invoice_number?.replace(/[^0-9]/g, "") || "-";

  return (
    <Document
      title={`Faktura ${invoice.invoice_number || "koncept"}`}
      author={issuer?.name || "FKTR.cz"}
      creator="FKTR.cz"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>
            FAKTURA {invoice.invoice_number || "KONCEPT"}
          </Text>
          <Text style={styles.issuerName}>{issuer?.name || ""}</Text>
        </View>

        <View style={styles.parties}>
          <View style={styles.partyCol}>
            <Text style={styles.sectionLabel}>Dodavatel</Text>
            <Text style={styles.partyName}>{issuer?.name || ""}</Text>
            {issuer?.company_id ? (
              <Text style={styles.line}>IČO: {issuer.company_id}</Text>
            ) : null}
            {issuerBilling.street ? (
              <Text style={styles.line}>
                {issuerBilling.street} {issuerBilling.house_number || ""}
              </Text>
            ) : null}
            {issuerBilling.city ? (
              <Text style={styles.line}>
                {issuerBilling.zip || ""} {issuerBilling.city}
              </Text>
            ) : null}
            {issuerBilling.country ? (
              <Text style={styles.line}>{issuerBilling.country}</Text>
            ) : null}
          </View>

          <View style={styles.partyCol}>
            <Text style={styles.sectionLabel}>Odběratel</Text>
            <Text style={styles.partyName}>
              {invoice.clients?.name || "Malý odběratel (anonymní)"}
            </Text>
            {invoice.clients?.company_id ? (
              <Text style={styles.line}>IČO: {invoice.clients.company_id}</Text>
            ) : null}
            {invoice.clients?.vat_number ? (
              <Text style={styles.line}>DIČ: {invoice.clients.vat_number}</Text>
            ) : null}
            {clientAddress.street ? (
              <Text style={styles.line}>
                {clientAddress.street} {clientAddress.house_number || ""}
              </Text>
            ) : null}
            {clientAddress.city ? (
              <Text style={styles.line}>
                {clientAddress.zip || ""} {clientAddress.city}
              </Text>
            ) : null}
            {clientAddress.country ? (
              <Text style={styles.line}>{clientAddress.country}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Datum vystavení</Text>
            <Text>{labels.issueDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Datum splatnosti</Text>
            <Text>{labels.dueDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Způsob platby</Text>
            <Text>{paymentTypeName(invoice.payment_type_id)}</Text>
          </View>
          {invoice.payment_date ? (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Datum úhrady</Text>
              <Text>{labels.paymentDate}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.colDesc, styles.th]}>Popis položky</Text>
          {showQuantityColumn ? (
            <Text style={[styles.colQty, styles.th]}>Množství</Text>
          ) : null}
          {showUnitColumn ? (
            <Text style={[styles.colUnit, styles.th]}>Jedn.</Text>
          ) : null}
          {showUnitPriceColumn ? (
            <Text style={[styles.colPrice, styles.th]}>Cena/jedn.</Text>
          ) : null}
          <Text style={[styles.colTotal, styles.th]}>Celkem</Text>
        </View>

        {items.map((item, index) => {
          const unitAbbr = item.unit_id
            ? unitLookup[item.unit_id]?.abbreviation
            : null;
          const hasPrice =
            item.unit_price !== null &&
            item.unit_price !== undefined &&
            item.unit_price !== "" &&
            Number(item.unit_price) !== 0;
          const lineTotal =
            hasPrice && item.quantity != null
              ? Number(item.quantity) * Number(item.unit_price)
              : null;

          return (
            <View key={item.id || index} style={styles.tableRow} wrap={false}>
              <Text style={styles.colDesc}>{item.description}</Text>
              {showQuantityColumn ? (
                <Text style={styles.colQty}>
                  {item.quantity != null
                    ? `${labels.formatNumber(item.quantity)}${
                        unitAbbr && !showUnitColumn ? ` ${unitAbbr}` : ""
                      }`
                    : "-"}
                </Text>
              ) : null}
              {showUnitColumn ? (
                <Text style={styles.colUnit}>{unitAbbr || "-"}</Text>
              ) : null}
              {showUnitPriceColumn ? (
                <Text style={styles.colPrice}>
                  {hasPrice
                    ? labels.formatCurrency(
                        item.unit_price,
                        invoice.currency
                      )
                    : "-"}
                </Text>
              ) : null}
              <Text style={styles.colTotal}>
                {lineTotal != null
                  ? labels.formatCurrency(lineTotal, invoice.currency)
                  : "-"}
              </Text>
            </View>
          );
        })}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Celkem k úhradě:</Text>
          <Text style={styles.totalAmount}>
            {labels.formatCurrency(invoice.total_amount, invoice.currency)}
          </Text>
        </View>

        {invoice.note ? (
          <View style={styles.note}>
            <Text style={styles.sectionLabel}>Poznámka</Text>
            <Text style={styles.noteText}>{invoice.note}</Text>
          </View>
        ) : null}

        {issuer?.bank_account ? (
          <View style={styles.payment} wrap={false}>
            <View style={styles.paymentDetails}>
              <Text style={styles.sectionLabel}>Platební údaje</Text>
              <Text style={styles.line}>
                Číslo účtu: {issuer.bank_account}
              </Text>
              <Text style={styles.line}>Variabilní symbol: {vs}</Text>
              <Text style={styles.line}>
                Částka:{" "}
                {labels.formatCurrency(invoice.total_amount, invoice.currency)}
              </Text>
            </View>
            {qrDataUrl ? (
              <View style={styles.qrWrap}>
                <Image src={qrDataUrl} style={styles.qr} />
              </View>
            ) : null}
          </View>
        ) : null}

        <Text style={styles.footer} fixed>
          {issuer?.name || "Dodavatel"} vygeneroval fakturu v aplikaci www.fktr.cz
        </Text>
      </Page>
    </Document>
  );
}
