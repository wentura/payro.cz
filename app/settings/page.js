import Layout from "@/app/components/Layout";
import { getCurrentUser } from "@/app/lib/auth";
import { getUserProfile } from "@/app/lib/services/getUserProfile";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";

/**
 * Settings Page
 *
 * User profile and company settings
 */

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userData = await getUserProfile(user.id);

  if (!userData) {
    return (
      <Layout user={user}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-500">Chyba při načítání uživatelských dat</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="max-w-7xl mx-auto">
        <SettingsForm userData={userData} />
      </div>
    </Layout>
  );
}
