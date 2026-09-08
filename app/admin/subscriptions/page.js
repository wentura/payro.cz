import AdminSubscriptionsManager from "@/app/components/AdminSubscriptionsManager";
import ServerLayout from "@/app/components/ServerLayout";
import { getCurrentUser, isAdminUser } from "@/app/lib/auth";
import { getAllUsersWithStats } from "@/app/lib/services/AdminService";
import { getPlans } from "@/app/lib/services/getPlans";
import { redirect } from "next/navigation";

/**
 * Admin Subscriptions Page
 *
 * Server component that fetches initial data and renders the client component
 */

export default async function AdminSubscriptionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  if (!isAdminUser(user)) {
    return (
      <ServerLayout user={user}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Přístup odepřen
          </h1>
          <p className="text-gray-600">
            Tato stránka je přístupná pouze administrátorům.
          </p>
        </div>
      </ServerLayout>
    );
  }

  const [users, plans] = await Promise.all([
    getAllUsersWithStats(),
    getPlans(),
  ]);

  return (
    <ServerLayout user={user}>
      <AdminSubscriptionsManager
        initialUsers={users}
        initialPlans={plans}
        initialUser={user}
      />
    </ServerLayout>
  );
}
