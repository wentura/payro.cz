import {
  getAllUsersWithStats,
  getPendingPayments,
  getSubscriptionStats,
  getAdminBankAccount,
} from "@/app/lib/services/AdminService";
import Badge from "@/app/components/ui/Badge";
import Card from "@/app/components/ui/Card";
import { formatCurrency, formatDateCZ } from "@/app/lib/utils";
import Link from "next/link";

const FILTERS = [
  { id: "active", label: "Aktivní" },
  { id: "deactivated", label: "Deaktivovaní" },
  { id: "deleted", label: "Smazaní" },
  { id: "all", label: "Všichni" },
];

const PAGE_SIZE = 50;

function statusBadge(status) {
  if (status === "active") return <Badge variant="paid">active</Badge>;
  if (status === "pending_payment")
    return <Badge variant="overdue">pending</Badge>;
  if (status === "canceled") return <Badge variant="canceled">canceled</Badge>;
  return <Badge>{status || "—"}</Badge>;
}

export default async function AdminPage({ searchParams }) {
  const params = await searchParams;
  const currentFilter = params?.filter || "active";
  const q = (params?.q || "").toString().trim().toLowerCase();
  const page = Math.max(1, Number.parseInt(params?.page, 10) || 1);

  const [allUsers, subscriptionStats, pendingPayments] = await Promise.all([
    getAllUsersWithStats(),
    getSubscriptionStats(),
    getPendingPayments(),
  ]);

  const bankAccount = getAdminBankAccount();
  const totalMrr = (subscriptionStats || []).reduce(
    (sum, p) => sum + (p.mrr || 0),
    0
  );
  const paidActive = allUsers.filter(
    (u) => u.subscription?.status === "active" && u.subscription?.planId > 1
  ).length;

  let filteredUsers = allUsers.filter((userData) => {
    if (currentFilter === "all") return true;
    if (currentFilter === "deleted") return userData.deleted_at !== null;
    if (currentFilter === "deactivated") {
      return userData.deactivated_at !== null && userData.deleted_at === null;
    }
    return userData.deactivated_at === null && userData.deleted_at === null;
  });

  if (q) {
    filteredUsers = filteredUsers.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.contact_email?.toLowerCase().includes(q) ||
        u.company_id?.toLowerCase().includes(q)
    );
  }

  const total = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageUsers = filteredUsers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const filterHref = (filterId) => {
    const search = new URLSearchParams();
    if (filterId !== "active") search.set("filter", filterId);
    if (q) search.set("q", q);
    const qs = search.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };

  const pageHref = (nextPage) => {
    const search = new URLSearchParams();
    if (currentFilter !== "active") search.set("filter", currentFilter);
    if (q) search.set("q", q);
    if (nextPage > 1) search.set("page", String(nextPage));
    const qs = search.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-fktr-muted">Uživatelé</div>
          <div className="mt-2 text-3xl font-medium text-fktr-fg tracking-tight">
            {allUsers.length}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-fktr-muted">Placená active</div>
          <div className="mt-2 text-3xl font-medium text-fktr-accent tracking-tight">
            {paidActive}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-fktr-muted">Čeká na platbu</div>
          <div className="mt-2 text-3xl font-medium text-fktr-warning tracking-tight">
            {pendingPayments.length}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-fktr-muted">MRR (odhad)</div>
          <div className="mt-2 text-2xl font-medium text-fktr-fg tracking-tight">
            {formatCurrency(totalMrr)}
          </div>
        </Card>
      </div>

      {pendingPayments.length > 0 && (
        <Card title={`Čekající platby (${pendingPayments.length})`}>
          <p className="text-left text-sm text-fktr-muted mb-4">
            Účet pro převod:{" "}
            <span className="font-medium text-fktr-fg">{bankAccount}</span>
          </p>
          <div className="overflow-x-auto text-left">
            <table className="min-w-full divide-y divide-fktr-border text-sm">
              <thead>
                <tr className="text-fktr-muted text-xs uppercase tracking-wider">
                  <th className="py-2 pr-3 text-left">Uživatel</th>
                  <th className="py-2 pr-3 text-left">Plán</th>
                  <th className="py-2 pr-3 text-left">Částka</th>
                  <th className="py-2 pr-3 text-left">VS</th>
                  <th className="py-2 text-right">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fktr-border">
                {pendingPayments.map((p) => (
                  <tr key={p.subscription.id}>
                    <td className="py-3 pr-3">
                      <div className="font-medium text-fktr-fg">{p.name}</div>
                      <div className="text-fktr-muted text-xs">{p.email}</div>
                    </td>
                    <td className="py-3 pr-3">
                      {p.subscription.plan?.name} /{" "}
                      {p.subscription.billingCycle === "yearly"
                        ? "rok"
                        : "měsíc"}
                    </td>
                    <td className="py-3 pr-3">
                      {formatCurrency(p.subscription.amount)}
                    </td>
                    <td className="py-3 pr-3 font-mono text-xs">
                      {p.subscription.variableSymbol || "—"}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/users/${p.id}`}
                        className="text-fktr-accent hover:text-fktr-accent-hover font-medium"
                      >
                        Detail / aktivovat →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Link
                key={f.id}
                href={filterHref(f.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                  currentFilter === f.id
                    ? "border-fktr-accent bg-fktr-accent-soft text-fktr-accent"
                    : "border-fktr-border text-fktr-muted hover:text-fktr-fg"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
          <form className="flex gap-2" action="/admin" method="get">
            {currentFilter !== "active" && (
              <input type="hidden" name="filter" value={currentFilter} />
            )}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Hledat jméno, e-mail, IČO…"
              className="rounded-lg border border-fktr-border px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-fktr-accent/20 focus:border-fktr-accent"
            />
            <button
              type="submit"
              className="rounded-lg bg-fktr-accent text-white px-4 py-2 text-sm font-medium hover:bg-fktr-accent-hover"
            >
              Hledat
            </button>
          </form>
        </div>

        <Card title={`Uživatelé (${total})`}>
          <div className="overflow-x-auto text-left">
            <table className="min-w-full divide-y divide-fktr-border text-sm">
              <thead>
                <tr className="text-fktr-muted text-xs uppercase tracking-wider">
                  <th className="py-2 pr-3 text-left">Jméno</th>
                  <th className="py-2 pr-3 text-left hidden md:table-cell">
                    E-mail
                  </th>
                  <th className="py-2 pr-3 text-left">Plán</th>
                  <th className="py-2 pr-3 text-left">Status</th>
                  <th className="py-2 pr-3 text-left hidden lg:table-cell">
                    Registrace
                  </th>
                  <th className="py-2 text-right">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fktr-border">
                {pageUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-fktr-muted"
                    >
                      Žádní uživatelé
                    </td>
                  </tr>
                ) : (
                  pageUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-fktr-bg/80">
                      <td className="py-3 pr-3 font-medium text-fktr-fg">
                        {u.name}
                        {u.deactivated_at && (
                          <span className="ml-2 text-xs text-fktr-warning">
                            deakt.
                          </span>
                        )}
                        {u.deleted_at && (
                          <span className="ml-2 text-xs text-fktr-danger">
                            smazán
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-fktr-muted hidden md:table-cell">
                        {u.contact_email}
                      </td>
                      <td className="py-3 pr-3">
                        {u.subscription?.plan?.name || "—"}
                        {u.subscription?.billingCycle && (
                          <span className="text-fktr-muted text-xs ml-1">
                            /{" "}
                            {u.subscription.billingCycle === "yearly"
                              ? "rok"
                              : "měs."}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        {statusBadge(u.subscription?.status)}
                      </td>
                      <td className="py-3 pr-3 text-fktr-muted hidden lg:table-cell">
                        {formatDateCZ(u.created_at)}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="text-fktr-accent hover:text-fktr-accent-hover font-medium"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-fktr-border text-sm">
              <span className="text-fktr-muted">
                Stránka {safePage} / {totalPages}
              </span>
              <div className="flex gap-3">
                {safePage > 1 && (
                  <Link
                    href={pageHref(safePage - 1)}
                    className="text-fktr-accent font-medium"
                  >
                    Předchozí
                  </Link>
                )}
                {safePage < totalPages && (
                  <Link
                    href={pageHref(safePage + 1)}
                    className="text-fktr-accent font-medium"
                  >
                    Další
                  </Link>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
