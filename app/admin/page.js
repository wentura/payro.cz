import Layout from "@/app/components/Layout";
import Badge from "@/app/components/ui/Badge";
import Card from "@/app/components/ui/Card";
import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { formatDateCZ } from "@/app/lib/utils";
import { redirect } from "next/navigation";

/**
 * Admin Page
 *
 * Only accessible by admin user (svoboda.zbynek@gmail.com)
 */

const ADMIN_EMAIL = "svoboda.zbynek@gmail.com";

async function getAllUsersWithStats() {
  try {
    // Get all users
    const { data: users, error: usersError } = await supabase.from("users")
      .select(`
          id,
          name,
          contact_email,
          company_id,
          created_at,
          invoices(
            id,
            total_amount,
            currency,
            is_paid,
            is_canceled,
            is_deleted
          )
        `);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return [];
    }

    // Process users with stats
    const userStats = users.map((user) => {
      const invoices = (user.invoices || []).filter((inv) => !inv.is_deleted);
      const totalInvoices = invoices.length;
      const paidInvoices = invoices.filter((inv) => inv.is_paid).length;
      const unpaidInvoices = invoices.filter(
        (inv) => !inv.is_paid && !inv.is_canceled
      ).length;
      const totalRevenue = invoices
        .filter((inv) => inv.is_paid)
        .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

      return {
        ...user,
        stats: {
          totalInvoices,
          paidInvoices,
          unpaidInvoices,
          totalRevenue,
        },
      };
    });

    return userStats;
  } catch (error) {
    console.error("Error in getAllUsersWithStats:", error);
    return [];
  }
}

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  if (user.contact_email !== ADMIN_EMAIL) {
    return (
      <Layout user={user}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Přístup odepřen
          </h1>
          <p className="text-gray-600">
            Tato stránka je přístupná pouze administrátorům.
          </p>
        </div>
      </Layout>
    );
  }

  // Get all users with stats
  const allUsers = await getAllUsersWithStats();

  return (
    <Layout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administrace</h1>
          <p className="mt-2 text-gray-600">
            Administrátorské nástroje a přehled systému
          </p>
        </div>

        {/* Admin Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Informace o systému">
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium text-gray-500">Přihlášený admin:</dt>
                <dd className="text-gray-900">{user.contact_email}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Uživatel:</dt>
                <dd className="text-gray-900">{user.name}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">User ID:</dt>
                <dd className="text-gray-900 font-mono text-xs">{user.id}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Přístup k funkcím">
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800">
                  ✓ Máte plný administrátorský přístup
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p>Zde můžete přidat další administrátorské funkce:</p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Správa všech uživatelů</li>
                  <li>Statistiky celého systému</li>
                  <li>Konfigurace aplikace</li>
                  <li>Export dat</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Users List */}
        <Card title="Seznam uživatelů">
          {allUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Žádní uživatelé nenalezeni</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uživatel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IČO
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrován
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faktury
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Příjem
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allUsers.map((userData) => (
                    <tr key={userData.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {userData.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userData.contact_email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userData.company_id || "-"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateCZ(userData.created_at)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Badge variant="default">
                            {userData.stats.totalInvoices} celkem
                          </Badge>
                          <Badge variant="paid">
                            {userData.stats.paidInvoices} zaplaceno
                          </Badge>
                          <Badge variant="unpaid">
                            {userData.stats.unpaidInvoices} nezaplaceno
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {userData.stats.totalRevenue > 0
                          ? `${userData.stats.totalRevenue.toLocaleString(
                              "cs-CZ"
                            )} CZK`
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
