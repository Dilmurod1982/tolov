import { useAuthStore } from "../../store/authStore";
import { useTodayPayments } from "../../hooks/useTodayPayments";
import StatCard from "../../components/StatCard";
import { Link } from "react-router-dom";

export default function OperatorDashboard() {
  const { profile } = useAuthStore();
  const { items } = useTodayPayments(profile?.stationId);

  const total = items.reduce((s, p) => s + (p.amount || 0), 0);
  const last = items.slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Панель оператора</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Оплат сегодня" value={items.length} />
        <StatCard
          label="Сумма за смену"
          value={total.toLocaleString("ru-RU")}
          accent="green"
        />
        <StatCard
          label="Последняя оплата"
          value={
            items[0] ? `${items[0].amount.toLocaleString("ru-RU")} сум` : "—"
          }
        />
      </div>

      <div className="flex gap-3">
        <Link to="/operator/accounting" className="btn-primary">
          Перейти в учёт
        </Link>
        <Link to="/statistics" className="btn-secondary">
          Статистика
        </Link>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Последние 5 оплат
        </h2>
        <div className="card divide-y">
          {last.length === 0 && (
            <div className="py-3 text-gray-500">Нет данных</div>
          )}
          {last.map((p) => (
            <div key={p.id} className="flex justify-between py-2 text-sm">
              <span>
                Колонка {p.columnId} · {p.attendantName}
              </span>
              <span className="font-semibold">
                {p.amount.toLocaleString("ru-RU")} сум
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
