import Link from "next/link";
import ServerLayout from "@/app/components/ServerLayout";
import { getCurrentUser, isAdminUser } from "@/app/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  if (!isAdminUser(user)) {
    return (
      <ServerLayout user={user}>
        <div className="max-w-lg mx-auto py-20 px-4 text-center">
          <h1 className="text-2xl font-medium text-fktr-fg mb-2 tracking-tight">
            Přístup odepřen
          </h1>
          <p className="text-fktr-muted mb-6">
            Tato sekce je přístupná pouze administrátorům.
          </p>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-fktr-accent hover:text-fktr-accent-hover"
          >
            Zpět na přehled
          </Link>
        </div>
      </ServerLayout>
    );
  }

  return (
    <ServerLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-fktr-border pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-fktr-fg">
              Administrace
            </h1>
            <p className="mt-1 text-sm text-fktr-muted">
              Uživatelé, platby a předplatné
            </p>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link
              href="/admin"
              className="font-medium text-fktr-accent hover:text-fktr-accent-hover"
            >
              Hub
            </Link>
          </nav>
        </div>
        {children}
      </div>
    </ServerLayout>
  );
}
