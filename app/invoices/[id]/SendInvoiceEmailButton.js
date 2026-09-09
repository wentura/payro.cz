"use client";

/**
 * Send Invoice / Reminder Email Button + Modal
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Modal from "@/app/components/ui/Modal";

const MODES = {
  invoice: {
    endpoint: (id) => `/api/invoices/${id}/send`,
    buttonLabel: "Odeslat e-mailem",
    buttonVariant: "primary",
    title: "Odeslat fakturu e-mailem",
    description:
      "PDF faktury bude přiloženo k emailu. Pokud je faktura ještě koncept, nejdřív se označí jako odeslaná a dostane číslo.",
    submitLabel: "Odeslat s PDF",
    submittingLabel: "Odesílám...",
    successMessage: "Faktura byla odeslána e-mailem",
    errorFallback: "Chyba při odesílání faktury",
  },
  reminder: {
    endpoint: (id) => `/api/invoices/${id}/remind`,
    buttonLabel: "Poslat upomínku",
    buttonVariant: "secondary",
    title: "Poslat upomínku e-mailem",
    description:
      "Klientovi přijde upomínka s PDF faktury v příloze. Faktura musí být odeslaná a nezaplacená.",
    submitLabel: "Odeslat upomínku",
    submittingLabel: "Odesílám...",
    successMessage: "Upomínka byla odeslána e-mailem",
    errorFallback: "Chyba při odesílání upomínky",
  },
};

export default function SendInvoiceEmailButton({
  invoiceId,
  defaultTo = "",
  senderEmail = "",
  mode = "invoice",
}) {
  const config = MODES[mode] || MODES.invoice;
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [to, setTo] = useState(defaultTo || "");
  const [ccSelf, setCcSelf] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const openModal = () => {
    setTo(defaultTo || "");
    setCcSelf(false);
    setError("");
    setSuccess("");
    setIsOpen(true);
  };

  const closeModal = () => {
    if (isSending) return;
    setIsOpen(false);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    setIsSending(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(config.endpoint(invoiceId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: to.trim(),
          ccSelf,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || config.errorFallback);
        setIsSending(false);
        return;
      }

      setSuccess(result.message || config.successMessage);
      setIsSending(false);
      router.refresh();

      setTimeout(() => {
        setIsOpen(false);
        setSuccess("");
      }, 1200);
    } catch (err) {
      console.error("Error sending invoice email:", err);
      setError(config.errorFallback);
      setIsSending(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={config.buttonVariant}
        onClick={openModal}
      >
        {config.buttonLabel}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title={config.title}
        size="sm"
      >
        <form onSubmit={handleSend} className="space-y-4">
          <p className="text-sm text-gray-600 text-left">{config.description}</p>

          <Input
            label="Email příjemce"
            type="email"
            name={`to-${mode}`}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="klient@firma.cz"
            required
            disabled={isSending}
          />

          {senderEmail ? (
            <label className="flex items-center gap-2 text-sm text-gray-700 text-left">
              <input
                type="checkbox"
                checked={ccSelf}
                onChange={(e) => setCcSelf(e.target.checked)}
                disabled={isSending}
                className="rounded border-gray-300"
              />
              Poslat kopii na můj email ({senderEmail})
            </label>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600 text-left" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="text-sm text-green-700 text-left" role="status">
              {success}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
              disabled={isSending}
            >
              Zrušit
            </Button>
            <Button type="submit" variant="primary" disabled={isSending}>
              {isSending ? config.submittingLabel : config.submitLabel}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
