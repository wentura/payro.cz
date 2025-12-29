"use client";

/**
 * Edit Client Form Component
 *
 * Client component for editing an existing client
 * Receives client data as props (loaded on server)
 */

import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditClientForm({ client }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  // Parse address from client data
  const address =
    typeof client.address === "string"
      ? JSON.parse(client.address)
      : client.address || {};

  const [formData, setFormData] = useState({
    name: client.name || "",
    company_id: client.company_id || "",
    vat_number: client.vat_number || "",
    contact_email: client.contact_email || "",
    contact_phone: client.contact_phone || "",
    street: address.street || "",
    house_number: address.house_number || "",
    city: address.city || "",
    zip: address.zip || "",
    country: address.country || "Česká republika",
    note: client.note || "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Chyba při ukládání klienta");
        setIsSaving(false);
        return;
      }

      router.push("/clients");
      router.refresh();
    } catch (err) {
      console.error("Error updating client:", err);
      setError("Neočekávaná chyba při ukládání klienta");
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Opravdu chcete smazat tohoto klienta? Tuto akci nelze vrátit zpět."
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Chyba při mazání klienta");
        setIsDeleting(false);
        return;
      }

      router.push("/clients");
      router.refresh();
    } catch (err) {
      console.error("Error deleting client:", err);
      setError("Neočekávaná chyba při mazání klienta");
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="text-left">
          <h3 className="text-lg font-medium text-gray-900 mb-2 mt-8">
            Základní informace
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Název / Jméno"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Jan Novák / Firma s.r.o."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="IČO"
                name="company_id"
                value={formData.company_id}
                onChange={handleChange}
                placeholder="12345678"
              />

              <Input
                label="DIČ"
                name="vat_number"
                value={formData.vat_number}
                onChange={handleChange}
                placeholder="CZ12345678"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-left">
          <h3 className="text-lg font-medium text-gray-900 mb-2 mt-8">
            Kontaktní údaje
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              name="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={handleChange}
              placeholder="klient@email.cz"
            />

            <Input
              label="Telefon"
              name="contact_phone"
              type="tel"
              value={formData.contact_phone}
              onChange={handleChange}
              placeholder="+420 123 456 789"
            />
          </div>
        </div>

        {/* Address */}
        <div className="text-left">
          <h3 className="text-lg font-medium text-gray-900 mb-2 mt-8">
            Adresa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-4 gap-4">
              <Input
                label="Ulice"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Hlavní"
                className="col-span-3"
              />

              <Input
                label="Č.p."
                name="house_number"
                value={formData.house_number}
                onChange={handleChange}
                placeholder="123"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Město"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Praha"
                className="col-span-2"
              />

              <Input
                label="PSČ"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                placeholder="110 00"
              />
            </div>

            <Input
              label="Země"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Note */}
        <div className="text-left mt-8">
          <Textarea
            label="Poznámka"
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Interní poznámka o klientovi..."
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Mazání..." : "Smazat klienta"}
          </Button>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Zrušit
            </Button>

            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? "Ukládání..." : "Uložit změny"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
