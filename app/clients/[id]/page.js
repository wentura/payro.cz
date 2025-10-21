/**
 * Edit Client Page
 *
 * Form for editing an existing client
 */

import Layout from "@/app/components/Layout";
import Button from "@/app/components/ui/Button";
import { getCurrentUser } from "@/app/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import EditClientForm from "./EditClientForm";

export default async function EditClientPage({ params }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <Layout user={user} className="flex-grow flex flex-col">
      <div className="space-y-6 w-full mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div className="mx-auto md:mx-0">
            <h1 className="text-3xl font-bold text-gray-900">
              Upravit klienta
            </h1>
            <p className="mt-2 text-gray-600">Upravte informace o klientovi</p>
          </div>
          <Link href="/clients">
            <Button variant="secondary">Zpět na klienty</Button>
          </Link>
        </div>

        <EditClientForm clientId={id} />
      </div>
    </Layout>
  );
}
