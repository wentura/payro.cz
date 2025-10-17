/**
 * Server Layout Component
 *
 * Server-side wrapper that fetches admin status and passes it to client Layout
 */

import { isCurrentUserAdmin } from "@/app/lib/auth";
import Layout from "./Layout";

export default async function ServerLayout({ children, user }) {
  const isAdmin = await isCurrentUserAdmin();

  return (
    <Layout user={user} isAdmin={isAdmin} className="flex-grow flex flex-col">
      {children}
    </Layout>
  );
}
