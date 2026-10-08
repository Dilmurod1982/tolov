import { useAuthStore } from "../../store/authStore";
import { useTodayPayments } from "../../hooks/useTodayPayments";
import StatCard from "../../components/StatCard";
import PaymentCard from "../../components/PaymentCard";
import { useT } from "../../hooks/useT";

export default function AdminDashboard() {
  const { profile } = useAuthStore();
  const { items, loading } = useTodayPayments(profile?.stationId);
  const t = useT();

  const total = items.reduce((s, p) => s + (p.amount || 0), 0);
  const cash = items
    .filter((p) => p.method === "cash")
    .reduce((s, p) => s + p.amount, 0);
  const card = items
    .filter((p) => p.method === "card")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t("adminPanel")}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("paymentsToday")} value={items.length} />
        <StatCard
          label={t("totalSum")}
          value={total.toLocaleString("ru-RU")}
          accent="green"
        />
        <StatCard label={t("cash")} value={cash.toLocaleString("ru-RU")} />
        <StatCard label={t("card")} value={card.toLocaleString("ru-RU")} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
          {t("lastPayments")}
        </h2>
        {loading ? (
          <div className="text-gray-500 dark:text-gray-400">{t("loading")}</div>
        ) : items.length === 0 ? (
          <div className="card text-gray-500 dark:text-gray-400">
            {t("noPayments")}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {items.slice(0, 6).map((p) => (
              <PaymentCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
