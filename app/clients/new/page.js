"use client";

/**
 * New Client Page
 *
 * Form for creating a new client
 */

import ARESModal from "@/app/components/ARESModal";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewClientPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isARESModalOpen, setIsARESModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    company_id: "",
    contact_email: "",
    contact_phone: "",
    street: "",
    house_number: "",
    city: "",
    zip: "",
    country: "Česká republika",
    note: "",
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
    setIsLoading(true);

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Chyba při vytváření klienta");
        setIsLoading(false);
        return;
      }

      router.push("/clients");
      router.refresh();
    } catch (err) {
      console.error("Error creating client:", err);
      setError("Neočekávaná chyba při vytváření klienta");
      setIsLoading(false);
    }
  };

  const handleARESSelect = (company) => {
    setFormData({
      ...formData,
      name: company.name || "",
      company_id: company.company_id || "",
      contact_email: company.contact_email || "",
      contact_phone: company.contact_phone || "",
      street: company.address?.street || "",
      house_number: company.address?.houseNumber || "",
      city: company.address?.city || "",
      zip: company.address?.zip || "",
      country: company.address?.country || "Česká republika",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Nový klient</h1>
          <p className="mt-2 text-gray-600">
            Vyplňte informace o novém klientovi
          </p>
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Základní informace
                </h3>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsARESModalOpen(true)}
                >
                  🔍 Vyhledat v ARES
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Název / Jméno"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Jan Novák / Firma s.r.o."
                />

                <Input
                  label="IČO"
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleChange}
                  placeholder="12345678"
                />
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
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Zrušit
              </Button>

              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? "Vytváření..." : "Vytvořit klienta"}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* ARES Search Modal */}
      <ARESModal
        isOpen={isARESModalOpen}
        onClose={() => setIsARESModalOpen(false)}
        onSelectCompany={handleARESSelect}
      />
    </div>
  );
}
