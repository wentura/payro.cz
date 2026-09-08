/**
 * Server Layout Component
 *
 * Server-side wrapper that fetches admin status from the user record
 */

import { isAdminUser } from "@/app/lib/auth";
import Layout from "./Layout";

export default function ServerLayout({ children, user }) {
  return (
    <Layout user={user} isAdmin={isAdminUser(user)} className="flex-grow flex flex-col">
      {children}
    </Layout>
  );
}
