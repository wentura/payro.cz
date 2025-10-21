/**
 * New Invoice Page
 *
 * Form for creating a new invoice with items
 */

import Layout from "@/app/components/Layout";
import Button from "@/app/components/ui/Button";
import { getCurrentUser } from "@/app/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import NewInvoiceForm from "./NewInvoiceForm";

export default async function NewInvoicePage({ searchParams }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const preselectedClientId = searchParams?.client_id || null;

  return (
    <Layout user={user} className="flex-grow flex flex-col">
      <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div className="mx-auto md:mx-0">
            <h1 className="text-3xl font-bold text-gray-900">Nová faktura</h1>
            <p className="mt-2 text-gray-600">Vytvořte novou fakturu</p>
          </div>
          <Link href="/invoices">
            <Button variant="secondary">Zpět na faktury</Button>
          </Link>
        </div>

        <NewInvoiceForm user={user} preselectedClientId={preselectedClientId} />
      </div>
    </Layout>
  );
}
