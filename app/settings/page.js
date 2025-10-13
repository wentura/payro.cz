import Layout from "@/app/components/Layout";
import { getCurrentUser } from "@/app/lib/auth";
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

  return (
    <Layout user={user}>
      <SettingsForm />
    </Layout>
  );
}
