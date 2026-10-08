import { useMemo, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useRangePayments } from "../../hooks/useRangePayments";
import { useT } from "../../hooks/useT";

const OPERATOR_KEY = "__operator__";

function toInputDate(d) {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function exportCsv(rows, t) {
  const header = [
    t("date"),
    t("time"),
    t("source"),
    t("acceptedBy"),
    t("columnShort"),
    t("vehicle"),
    t("method"),
    t("volume"),
    t("amount"),
  ];

  const body = rows.map((p) => {
    const d = p.createdAt?.toDate?.() ?? new Date();
    const source =
      p.source === "operator" ? t("roleOperator") : t("roleAttendant");
    const acceptedBy =
      p.source === "operator" ? p.operatorName || "" : p.attendantName || "";
    return [
      d.toLocaleDateString("ru-RU"),
      d.toLocaleTimeString("ru-RU"),
      source,
      acceptedBy,
      p.columnId ?? "",
      p.vehicleNumber || "",
      p.method,
      p.volume ?? 0,
      p.amount ?? 0,
    ];
  });

  const csv = [header, ...body]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `statistics_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Statistics() {
  const { user, profile } = useAuthStore();
  const t = useT();

  const isAttendant = profile?.role === "attendant";

  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 6);

  const [fromStr, setFromStr] = useState(toInputDate(weekAgo));
  const [toStr, setToStr] = useState(toInputDate(today));
  const [selectedAttendants, setSelectedAttendants] = useState([]);

  const from = useMemo(() => {
    const d = new Date(fromStr + "T00:00:00");
    d.setHours(0, 0, 0, 0);
    return d;
  }, [fromStr]);

  const to = useMemo(() => {
    const d = new Date(toStr + "T23:59:59");
    d.setHours(23, 59, 59, 999);
    return d;
  }, [toStr]);

  const { items, loading } = useRangePayments(profile?.stationId, from, to);

  /* 1) Колонщик видит только свои записи */
  const visibleItems = useMemo(() => {
    if (!isAttendant) return items;
    return items.filter((p) => p.attendantId === user?.uid);
  }, [items, isAttendant, user?.uid]);

  /* 2) Список принимающих — только для админа/оператора */
  const attendants = useMemo(() => {
    if (isAttendant) return [];

    const map = new Map();
    let hasOperator = false;

    for (const p of visibleItems) {
      if (p.attendantId) {
        map.set(p.attendantId, p.attendantName || "—");
      } else if (p.operatorId || p.source === "operator") {
        hasOperator = true;
      }
    }

    const list = Array.from(map, ([id, name]) => ({ id, name }));
    if (hasOperator) {
      list.unshift({ id: OPERATOR_KEY, name: t("operatorCash") });
    }
    return list;
  }, [visibleItems, isAttendant, t]);

  /* 3) Фильтрация по принимающим */
  const filtered = useMemo(() => {
    if (isAttendant) return visibleItems;
    if (selectedAttendants.length === 0) return visibleItems;

    return visibleItems.filter((p) => {
      const key = p.attendantId || OPERATOR_KEY;
      return selectedAttendants.includes(key);
    });
  }, [visibleItems, selectedAttendants, isAttendant]);

  /* 4) Агрегация */
  const summary = useMemo(() => {
    const byAtt = new Map();
    let total = 0;
    let volume = 0;
    let cash = 0;
    let card = 0;
    let qr = 0;

    for (const p of filtered) {
      total += p.amount || 0;
      volume += p.volume || 0;

      if (p.method === "cash") cash += p.amount || 0;
      else if (p.method === "card") card += p.amount || 0;
      else if (p.method === "qr") qr += p.amount || 0;

      const key = p.attendantId || OPERATOR_KEY;
      const name = p.attendantId ? p.attendantName || "—" : t("operatorCash");

      const cur = byAtt.get(key) || { key, name, count: 0, sum: 0, volume: 0 };
      cur.count += 1;
      cur.sum += p.amount || 0;
      cur.volume += p.volume || 0;
      byAtt.set(key, cur);
    }

    return {
      total,
      volume,
      cash,
      card,
      qr,
      byAttendant: Array.from(byAtt.values()).sort((a, b) => b.sum - a.sum),
    };
  }, [filtered, t]);

  const toggleAttendant = (id) => {
    setSelectedAttendants((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const fmt = (n) => Number(n || 0).toLocaleString("ru-RU");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isAttendant ? t("myStatistics") : t("statsTitle")}
        </h1>
        {isAttendant && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {profile?.fullName}
          </span>
        )}
      </div>

      {/* даты */}
      <div className="card grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">{t("from")}</label>
          <input
            type="date"
            className="input"
            value={fromStr}
            onChange={(e) => setFromStr(e.target.value)}
          />
        </div>
        <div>
          <label className="label">{t("to")}</label>
          <input
            type="date"
            className="input"
            value={toStr}
            onChange={(e) => setToStr(e.target.value)}
          />
        </div>
        {!isAttendant && (
          <div className="flex items-end">
            <button
              className="btn-secondary w-full"
              onClick={() => setSelectedAttendants([])}
              disabled={selectedAttendants.length === 0}
            >
              {t("resetFilter")}
            </button>
          </div>
        )}
      </div>

      {/* фильтр принимающих */}
      {!isAttendant && (
        <div className="card">
          <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("acceptors")}
          </div>
          <div className="flex flex-wrap gap-2">
            {attendants.length === 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t("noData")}
              </span>
            )}
            {attendants.map((a) => {
              const active = selectedAttendants.includes(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => toggleAttendant(a.id)}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    active
                      ? "border-brand-500 bg-brand-50 text-brand-700 " +
                        "dark:bg-brand-900/40 dark:text-brand-200"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 " +
                        "dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* сводка */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("payments")}
          </div>
          <div className="text-2xl font-bold text-brand-700 dark:text-brand-400">
            {filtered.length}
          </div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("sum")}
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {fmt(summary.total)}
          </div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("volume")}
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {summary.volume.toFixed(1)}
          </div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("cash")} / {t("card")} / {t("qr")}
          </div>
          <div className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
            {fmt(summary.cash)} / {fmt(summary.card)} / {fmt(summary.qr)}
          </div>
        </div>
      </div>

      {/* по принимающим — только админ/оператор */}
      {!isAttendant && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {t("byAcceptors")}
            </h2>
            <button
              className="btn-secondary text-sm"
              disabled={filtered.length === 0}
              onClick={() => exportCsv(filtered, t)}
            >
              {t("exportCsv")}
            </button>
          </div>

          <div className="card overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead
                className="bg-gray-50 text-left text-xs uppercase text-gray-500
                                dark:bg-gray-700 dark:text-gray-300"
              >
                <tr>
                  <th className="px-3 py-2">{t("acceptedBy")}</th>
                  <th className="px-3 py-2 text-right">{t("payments")}</th>
                  <th className="px-3 py-2 text-right">{t("volume")}</th>
                  <th className="px-3 py-2 text-right">{t("sum")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {summary.byAttendant.map((a) => (
                  <tr key={a.key}>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      {a.name}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-100">
                      {a.count}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-100">
                      {a.volume.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-gray-50">
                      {fmt(a.sum)}
                    </td>
                  </tr>
                ))}
                {summary.byAttendant.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-3 py-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      {loading ? t("loading") : t("noData")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* детализация */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {isAttendant ? t("myPayments") : t("details")}
          </h2>
          {isAttendant && (
            <button
              className="btn-secondary text-sm"
              disabled={filtered.length === 0}
              onClick={() => exportCsv(filtered, t)}
            >
              {t("exportCsv")}
            </button>
          )}
        </div>

        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead
              className="bg-gray-50 text-left text-xs uppercase text-gray-500
                              dark:bg-gray-700 dark:text-gray-300"
            >
              <tr>
                <th className="px-3 py-2">{t("date")}</th>
                {!isAttendant && (
                  <>
                    <th className="px-3 py-2">{t("source")}</th>
                    <th className="px-3 py-2">{t("acceptedBy")}</th>
                  </>
                )}
                <th className="px-3 py-2">{t("columnShort")}</th>
                <th className="px-3 py-2 text-right">{t("sum")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.slice(0, 200).map((p) => {
                const d = p.createdAt?.toDate?.() ?? new Date();
                const isOperator = p.source === "operator";
                const acceptedBy = isOperator
                  ? p.operatorName || "—"
                  : p.attendantName || "—";

                return (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap px-3 py-2 text-gray-800 dark:text-gray-100">
                      {d.toLocaleDateString("ru-RU")}{" "}
                      {d.toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {!isAttendant && (
                      <>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-xs ${
                              isOperator
                                ? "bg-purple-100 text-purple-700 " +
                                  "dark:bg-purple-900/40 dark:text-purple-200"
                                : "bg-blue-100 text-blue-700 " +
                                  "dark:bg-blue-900/40 dark:text-blue-200"
                            }`}
                          >
                            {isOperator ? t("colCashBadge") : t("columnShort")}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                          {acceptedBy}
                        </td>
                      </>
                    )}

                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      {p.columnId ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-gray-50">
                      {fmt(p.amount)}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={isAttendant ? 3 : 5}
                    className="px-3 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    {loading ? t("loading") : t("noRecords")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {filtered.length > 200 && (
            <div className="p-3 text-xs text-gray-500 dark:text-gray-400">
              {t("shownFirst", { total: filtered.length })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
