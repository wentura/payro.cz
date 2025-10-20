"use client";

/**
 * Settings Form Component
 *
 * Client component for user settings form
 */

import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    company_id: "",
    contact_email: "",
    contact_phone: "",
    contact_website: "",
    bank_account: "",
    street: "",
    house_number: "",
    city: "",
    zip: "",
    country: "Česká republika",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/profile");
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError("Chyba při načítání uživatelských dat");
        setIsLoading(false);
        return;
      }

      const user = result.data;
      const billing =
        typeof user.billing_details === "string"
          ? JSON.parse(user.billing_details)
          : user.billing_details || {};

      setFormData({
        name: user.name || "",
        company_id: user.company_id || "",
        contact_email: user.contact_email || "",
        contact_phone: user.contact_phone || "",
        contact_website: user.contact_website || "",
        bank_account: user.bank_account || "",
        street: billing.street || "",
        house_number: billing.house_number || "",
        city: billing.city || "",
        zip: billing.zip || "",
        country: billing.country || "Česká republika",
      });

      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Neočekávaná chyba při načítání dat");
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Něco se pokazilo. Ale klid, zkus to znovu.");
        setIsSaving(false);
        return;
      }

      setSuccess("Hotovo. Nastavení uložené.");
      setIsSaving(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);

      // Refresh the page to update layout
      router.refresh();
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Něco se pokazilo. Ale klid, zkus to znovu.");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Načítání...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Nastavení
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-1 text-left">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-left">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4 text-left">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Basic Information */}
        <Card title="Základní informace" className="text-left px-1">
          <div className="grid grid-cols-1 gap-2 sm:gap-4 text-left">
            <Input
              label="Jméno / Název firmy"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Jan Novák / Moje firma s.r.o."
            />

            <Input
              label="IČO"
              name="company_id"
              value={formData.company_id}
              onChange={handleChange}
              placeholder="12345678"
            />
          </div>
        </Card>

        {/* Contact Information */}
        <Card title="Kontaktní údaje" className="text-left px-1">
          <div className="grid grid-cols-1 gap-2 sm:gap-4 text-left">
            <Input
              label="Email"
              name="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={handleChange}
              required
              placeholder="vas@email.cz"
            />

            <Input
              label="Telefon"
              name="contact_phone"
              type="tel"
              value={formData.contact_phone}
              onChange={handleChange}
              placeholder="+420 123 456 789"
            />

            <Input
              label="Web"
              name="contact_website"
              type="url"
              value={formData.contact_website}
              onChange={handleChange}
              placeholder="https://www.moje-firma.cz"
            />
          </div>
        </Card>

        {/* Banking Information */}
        <Card title="Bankovní údaje">
          <div className="grid grid-cols-1 gap-2 sm:gap-4 text-left">
            <Input
              label="Číslo účtu"
              name="bank_account"
              value={formData.bank_account}
              onChange={handleChange}
              placeholder="123456789/0100"
            />
            <p className="text-xs text-gray-500 text-left">
              Číslo účtu bude zobrazeno na faktuře pro platby
            </p>
          </div>
        </Card>

        {/* Billing Address */}
        <Card title="Fakturační adresa" className="text-left px-1">
          <div className="grid grid-cols-1 gap-2 sm:gap-4 text-left">
            <div className="grid grid-cols-4 gap-2 sm:gap-4 text-left">
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
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/dashboard")}
          >
            Zrušit
          </Button>

          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? "Ukládání..." : "Uložit změny"}
          </Button>
        </div>
      </form>
    </div>
  );
}
