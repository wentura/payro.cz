"use client";

/**
 * Edit Client Page
 *
 * Form for editing an existing client
 */

import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function EditClientPage({ params }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [client, setClient] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    company_id: "",
    vat_number: "",
    contact_email: "",
    contact_phone: "",
    street: "",
    house_number: "",
    city: "",
    zip: "",
    country: "Česká republika",
    note: "",
  });

  const fetchClient = useCallback(async () => {
    try {
      const { id } = await params;
      const response = await fetch(`/api/clients/${id}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError("Klient nenalezen");
        setIsLoading(false);
        return;
      }

      const clientData = result.data;
      const address =
        typeof clientData.address === "string"
          ? JSON.parse(clientData.address)
          : clientData.address || {};

      setClient(clientData);
      setFormData({
        name: clientData.name || "",
        company_id: clientData.company_id || "",
        vat_number: clientData.vat_number || "",
        contact_email: clientData.contact_email || "",
        contact_phone: clientData.contact_phone || "",
        street: address.street || "",
        house_number: address.house_number || "",
        city: address.city || "",
        zip: address.zip || "",
        country: address.country || "Česká republika",
        note: clientData.note || "",
      });

      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching client:", err);
      setError("Chyba při načítání klienta");
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

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
      const { id } = await params;
      const response = await fetch(`/api/clients/${id}`, {
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
      const { id } = await params;
      const response = await fetch(`/api/clients/${id}`, {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p>Načítání...</p>
        </div>
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => router.back()} className="mt-4">
            Zpět
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Upravit klienta</h1>
          <p className="mt-2 text-gray-600">Upravte informace o klientovi</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Základní informace
              </h3>
              <div className="grid grid-cols-1 gap-4">
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
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
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
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Adresa</h3>
              <div className="grid grid-cols-1 gap-4">
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
            <div>
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
      </div>
    </div>
  );
}
