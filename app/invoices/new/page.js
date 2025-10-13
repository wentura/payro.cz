"use client";

/**
 * New Invoice Page
 *
 * Form for creating a new invoice with items
 */

import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import Select from "@/app/components/ui/Select";
import Textarea from "@/app/components/ui/Textarea";
import {
  calculateInvoiceTotal,
  formatCurrency,
  formatNumber,
} from "@/app/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function NewInvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("client_id");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState([]);
  const [dueTerms, setDueTerms] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [units, setUnits] = useState([]);

  const [formData, setFormData] = useState({
    client_id: preselectedClientId || "",
    issue_date: new Date().toISOString().split("T")[0],
    due_term_id: "",
    payment_type_id: "",
    currency: "CZK",
    note: "",
  });

  const [items, setItems] = useState([
    {
      id: "1",
      description: "",
      quantity: 1,
      unit_id: "",
      unit_price: 0,
    },
  ]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      // Fetch clients
      const clientsRes = await fetch("/api/clients");
      const clientsData = await clientsRes.json();
      if (clientsData.success) {
        setClients(clientsData.data || []);
      }

      // Fetch due terms
      const dueTermsRes = await fetch("/api/due-terms");
      const dueTermsData = await dueTermsRes.json();
      if (dueTermsData.success) {
        setDueTerms(dueTermsData.data || []);
      }

      // Fetch payment types
      const paymentTypesRes = await fetch("/api/payment-types");
      const paymentTypesData = await paymentTypesRes.json();
      if (paymentTypesData.success) {
        setPaymentTypes(paymentTypesData.data || []);
      }

      // Fetch units
      const unitsRes = await fetch("/api/units");
      const unitsData = await unitsRes.json();
      if (unitsData.success) {
        setUnits(unitsData.data || []);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        unit_id: "",
        unit_price: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      alert("Faktura musí obsahovat alespoň jednu položku");
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      return total + quantity * unitPrice;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate items
    const validItems = items.filter(
      (item) => item.description && item.quantity > 0
    );
    if (validItems.length === 0) {
      setError("Přidejte alespoň jednu položku faktury");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          items: validItems.map((item, index) => ({
            description: item.description,
            quantity: parseFloat(item.quantity),
            unit_id: item.unit_id || null,
            unit_price: parseFloat(item.unit_price),
            order_number: index + 1,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Chyba při vytváření faktury");
        setIsLoading(false);
        return;
      }

      router.push("/invoices");
      router.refresh();
    } catch (err) {
      console.error("Error creating invoice:", err);
      setError("Neočekávaná chyba při vytváření faktury");
      setIsLoading(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Nová faktura</h1>
          <p className="mt-2 text-gray-700">Vytvořte novou fakturu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Invoice Header */}
          <Card title="Základní údaje">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Klient"
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                options={clients.map((c) => ({ value: c.id, label: c.name }))}
                required
                placeholder="Vyberte klienta"
                className="text-gray-700"
              />

              <Input
                label="Datum vystavení"
                name="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={handleChange}
                required
                className="text-gray-700"
              />

              <Select
                label="Splatnost"
                name="due_term_id"
                value={formData.due_term_id}
                onChange={handleChange}
                options={dueTerms.map((dt) => ({
                  value: dt.id,
                  label: dt.name,
                }))}
                placeholder="Vyberte splatnost"
                className="text-gray-700"
              />

              <Select
                label="Typ platby"
                name="payment_type_id"
                value={formData.payment_type_id}
                onChange={handleChange}
                options={paymentTypes.map((pt) => ({
                  value: pt.id,
                  label: pt.name,
                }))}
                placeholder="Vyberte typ platby"
                className="text-gray-700"
              />

              <Select
                label="Měna"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                options={[
                  { value: "CZK", label: "CZK - Česká koruna" },
                  { value: "EUR", label: "EUR - Euro" },
                ]}
                className="text-gray-700"
              />
            </div>

            <div className="mt-4">
              <Textarea
                label="Poznámka"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Interní poznámka k faktuře..."
                rows={3}
              />
            </div>
          </Card>

          {/* Invoice Items */}
          <Card
            title="Položky faktury"
            action={
              <Button type="button" size="sm" onClick={addItem}>
                + Přidat položku
              </Button>
            }
          >
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-medium text-gray-800">
                      Položka #{index + 1}
                    </h4>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕ Odstranit
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-5">
                      <Input
                        label="Popis"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        placeholder="Název položky / služby"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Input
                        label="Množství"
                        type="number"
                        step="0.001"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Select
                        label="Jednotka"
                        value={item.unit_id}
                        onChange={(e) =>
                          handleItemChange(index, "unit_id", e.target.value)
                        }
                        options={units.map((u) => ({
                          value: u.id,
                          label: u.abbreviation,
                        }))}
                        placeholder="-"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <Input
                        label="Cena za jednotku"
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          handleItemChange(index, "unit_price", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-2 text-right">
                    <span className="text-sm text-gray-600">Celkem: </span>
                    <span className="text-sm font-medium text-gray-800">
                      {formatCurrency(
                        (item.quantity || 0) * (item.unit_price || 0)
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-800">
                  Celková částka:
                </span>
                <span className="text-2xl font-bold text-gray-800">
                  {formatCurrency(total, formData.currency)}
                </span>
              </div>
            </div>
          </Card>

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
              {isLoading ? "Vytváření..." : "Vytvořit fakturu"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>Načítání...</p>
        </div>
      }
    >
      <NewInvoiceForm />
    </Suspense>
  );
}
