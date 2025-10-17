import AdminSubscriptionsManager from "@/app/components/AdminSubscriptionsManager";
import ServerLayout from "@/app/components/ServerLayout";
import { getCurrentUser } from "@/app/lib/auth";
import { redirect } from "next/navigation";

/**
 * Admin Subscriptions Page
 *
 * Server component that fetches initial data and renders the client component
 */

const ADMIN_EMAIL = "svoboda.zbynek@gmail.com";

async function getInitialData() {
  try {
    // For now, return empty data - the client component will fetch it
    // In a real implementation, you could fetch server-side data here
    return {
      users: [],
      plans: [],
    };
  } catch (error) {
    console.error("Error fetching initial data:", error);
    return {
      users: [],
      plans: [],
    };
  }
}

export default async function AdminSubscriptionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  if (user.contact_email !== ADMIN_EMAIL) {
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

  const initialData = await getInitialData();

  return (
    <ServerLayout user={user}>
      <AdminSubscriptionsManager
        initialUsers={initialData.users}
        initialPlans={initialData.plans}
      />
    </ServerLayout>
  );
}
