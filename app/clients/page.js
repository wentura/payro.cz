import ServerLayout from "@/app/components/ServerLayout";
import Pagination from "@/app/components/Pagination";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * Clients List Page
 *
 * Displays all clients with search and filtering
 */

const CLIENT_PAGE_SIZE = 50;

async function getClients(userId, page) {
  try {
    const from = (page - 1) * CLIENT_PAGE_SIZE;
    const to = from + CLIENT_PAGE_SIZE - 1;
    const { data, error, count } = await supabase
      .from("clients")
      .select(
        "id, name, company_id, vat_number, contact_email, contact_phone, address, created_at",
        {
          count: "exact",
        }
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching clients:", error);
      return { clients: [], total: 0 };
    }

    return { clients: data || [], total: count || 0 };
  } catch (error) {
    console.error("Error in getClients:", error);
    return { clients: [], total: 0 };
  }
}

export default async function ClientsPage({ searchParams }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params?.page, 10) || 1);
  const { clients, total } = await getClients(user.id, page);

  return (
    <ServerLayout user={user}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div className="mx-auto md:mx-0">
            <h1 className="text-3xl font-bold text-gray-900">Klienti</h1>
            <p className="mt-2 text-gray-600">
              Správa vašich klientů a zákazníků ({total})
            </p>
          </div>
          <Link href="/clients/new">
            <Button variant="primary">+ Nový klient</Button>
          </Link>
        </div>

        {/* Clients List */}
        <Card>
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Zatím nemáte žádné klienty
              </h3>
              <p className="text-gray-500 mb-6">
                Začněte přidáním prvního klienta
              </p>
              <Link href="/clients/new">
                <Button variant="primary">+ Přidat prvního klienta</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Název
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      IČO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      DIČ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Telefon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Město
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akce
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => {
                    const address =
                      typeof client.address === "string"
                        ? JSON.parse(client.address)
                        : client.address;

                    return (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-left">
                          <div className="text-sm font-medium text-gray-900">
                            {client.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell text-left">
                          {client.company_id || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell text-left">
                          {client.vat_number || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell text-left">
                          {client.contact_email || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell text-left">
                          {client.contact_phone || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell text-left">
                          {address?.city || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-left">
                          <Link
                            href={`/clients/${client.id}`}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Upravit
                          </Link>
                          <Link
                            href={`/invoices/new?client_id=${client.id}`}
                            className="text-green-600 hover:text-green-900"
                          >
                            Nová faktura
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <Pagination
            page={page}
            pageSize={CLIENT_PAGE_SIZE}
            total={total}
            makeHref={(nextPage) =>
              nextPage > 1 ? `/clients?page=${nextPage}` : "/clients"
            }
          />
        </Card>

        {/* Statistics
        {clients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="text-sm font-medium text-gray-500">
                Celkem klientů
              </div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {clients.length}
              </div>
            </Card>

            <Card>
              <div className="text-sm font-medium text-gray-500">S emailem</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {clients.filter((c) => c.contact_email).length}
              </div>
            </Card>

            <Card>
              <div className="text-sm font-medium text-gray-500">S IČO</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {clients.filter((c) => c.company_id).length}
              </div>
            </Card>
          </div>
        )} */}
      </div>
    </ServerLayout>
  );
}
