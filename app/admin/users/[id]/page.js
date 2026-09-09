import AdminActivateSubscriptionButton from "@/app/components/admin/AdminActivateSubscriptionButton";
import AdminCancelSubscriptionButton from "@/app/components/admin/AdminCancelSubscriptionButton";
import AdminChangePlanButton from "@/app/components/AdminChangePlanButton";
import DeactivateUserButton from "@/app/components/DeactivateUserButton";
import SoftDeleteUserButton from "@/app/components/SoftDeleteUserButton";
import Badge from "@/app/components/ui/Badge";
import Card from "@/app/components/ui/Card";
import { getAdminUserDetail } from "@/app/lib/services/AdminService";
import { getPlans } from "@/app/lib/services/getPlans";
import { formatCurrency, formatDateCZ } from "@/app/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";

function statusBadge(status) {
  if (status === "active") return <Badge variant="paid">active</Badge>;
  if (status === "pending_payment")
    return <Badge variant="overdue">pending_payment</Badge>;
  if (status === "canceled") return <Badge variant="canceled">canceled</Badge>;
  return <Badge>{status || "—"}</Badge>;
}

export default async function AdminUserDetailPage({ params }) {
  const { id } = await params;
  const [detail, plans] = await Promise.all([
    getAdminUserDetail(id),
    getPlans(),
  ]);

  if (!detail) {
    notFound();
  }

  const sub = detail.subscription;
  const isPending = sub?.status === "pending_payment";
  const isPaidPlan = sub?.planId > 1 && sub?.status === "active";

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <Link
          href="/admin"
          className="text-sm text-fktr-accent hover:text-fktr-accent-hover font-medium"
        >
          ← Zpět na hub
        </Link>
        <h2 className="mt-3 text-2xl font-medium tracking-tight text-fktr-fg">
          {detail.name}
        </h2>
        <p className="text-fktr-muted text-sm mt-1">{detail.contact_email}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card title="Účet">
          <div className="text-left space-y-2 text-sm">
            <p>
              <span className="text-fktr-muted">IČO:</span>{" "}
              {detail.company_id || "—"}
            </p>
            <p>
              <span className="text-fktr-muted">Registrace:</span>{" "}
              {formatDateCZ(detail.created_at)}
            </p>
            <p>
              <span className="text-fktr-muted">Poslední login:</span>{" "}
              {detail.last_login ? formatDateCZ(detail.last_login) : "—"}
            </p>
            <p>
              <span className="text-fktr-muted">Stav:</span>{" "}
              {detail.deleted_at
                ? "Smazán"
                : detail.deactivated_at
                  ? "Deaktivován"
                  : "Aktivní"}
            </p>
          </div>
        </Card>
        <Card title="Faktury">
          <div className="text-left space-y-2 text-sm">
            <p>
              <span className="text-fktr-muted">Celkem:</span>{" "}
              {detail.stats.totalInvoices}
            </p>
            <p>
              <span className="text-fktr-muted">Zaplacené:</span>{" "}
              {detail.stats.paidInvoices}
            </p>
            <p>
              <span className="text-fktr-muted">Nezaplacené:</span>{" "}
              {detail.stats.unpaidInvoices}
            </p>
            <p>
              <span className="text-fktr-muted">Tržby:</span>{" "}
              {formatCurrency(detail.stats.totalRevenue)}
            </p>
          </div>
        </Card>
      </div>

      <Card title="Předplatné">
        <div className="text-left space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium text-fktr-fg text-base">
              {sub?.plan?.name || "Bez plánu"}
            </span>
            {statusBadge(sub?.status)}
            {sub?.billingCycle && (
              <span className="text-fktr-muted">
                {sub.billingCycle === "yearly" ? "Roční" : "Měsíční"}
              </span>
            )}
          </div>
          <p className="text-fktr-muted">
            Období:{" "}
            {sub?.periodStart ? formatDateCZ(sub.periodStart) : "—"} →{" "}
            {sub?.periodEnd ? formatDateCZ(sub.periodEnd) : "—"}
          </p>
          {sub?.variableSymbol && (
            <p>
              VS:{" "}
              <span className="font-mono font-medium">{sub.variableSymbol}</span>
            </p>
          )}
          <p className="text-fktr-muted">
            Usage tento měsíc: {sub?.currentUsage ?? 0}
            {sub?.plan?.invoice_limit_monthly
              ? ` / ${sub.plan.invoice_limit_monthly}`
              : " (neomezeně)"}
          </p>

          <div className="flex flex-wrap gap-3 pt-2 border-t border-fktr-border">
            {isPending && sub?.id && (
              <AdminActivateSubscriptionButton
                userId={detail.id}
                subscriptionId={sub.id}
              />
            )}
            <AdminChangePlanButton
              userId={detail.id}
              currentPlanId={sub?.planId}
              currentBillingCycle={sub?.billingCycle || "monthly"}
              initialPlans={plans || []}
            />
            {isPaidPlan && (
              <AdminCancelSubscriptionButton userId={detail.id} />
            )}
          </div>
        </div>
      </Card>

      <Card title="Správa účtu">
        <div className="flex flex-wrap gap-3 text-left">
          <DeactivateUserButton
            userId={detail.id}
            isDeactivated={Boolean(detail.deactivated_at)}
          />
          <SoftDeleteUserButton
            userId={detail.id}
            isDeleted={Boolean(detail.deleted_at)}
            isDeactivated={Boolean(detail.deactivated_at)}
          />
        </div>
      </Card>

      {detail.history?.length > 0 && (
        <Card title="Historie statusů">
          <ul className="text-left text-sm space-y-2">
            {detail.history.map((h) => (
              <li key={h.id} className="border-b border-fktr-border pb-2">
                <span className="text-fktr-muted">
                  {formatDateCZ(h.created_at)}
                </span>
                : {h.old_status || "—"} → {h.new_status}
                {h.reason ? ` (${h.reason})` : ""}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
