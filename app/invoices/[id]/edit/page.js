/**
 * Edit Invoice Page
 *
 * Server component that loads data and passes to client form component
 */

import Layout from "@/app/components/Layout";
import Button from "@/app/components/ui/Button";
import { getCurrentUser } from "@/app/lib/auth";
import { getInvoiceForEdit } from "@/app/lib/services/getInvoiceForEdit";
import {
  getClients,
  getDueTerms,
  getPaymentTypes,
  getUnits,
} from "@/app/lib/services/getReferenceData";
import Link from "next/link";
import { redirect } from "next/navigation";
import EditInvoiceForm from "./EditInvoiceForm";

export default async function EditInvoicePage({ params }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  // Load all data in parallel
  const [invoice, clients, dueTerms, paymentTypes, units] = await Promise.all([
    getInvoiceForEdit(id, user.id),
    getClients(user.id),
    getDueTerms(),
    getPaymentTypes(),
    getUnits(),
  ]);

  // Handle errors
  if (!invoice) {
    return (
      <Layout user={user} className="flex-grow flex flex-col">
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <p className="text-red-600">Faktura nenalezena</p>
            <Link href="/invoices" className="mt-4 inline-block">
              <Button variant="secondary">Zpět na faktury</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (invoice.error) {
    return (
      <Layout user={user} className="flex-grow flex flex-col">
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <p className="text-red-600">{invoice.error}</p>
            <Link href={`/invoices/${id}`} className="mt-4 inline-block">
              <Button variant="secondary">Zpět na fakturu</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} className="flex-grow flex flex-col">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Upravit fakturu
            </h1>
          </div>

          <EditInvoiceForm
            invoice={invoice}
            clients={clients}
            dueTerms={dueTerms}
            paymentTypes={paymentTypes}
            units={units}
          />
        </div>
      </div>
    </Layout>
  );
}
