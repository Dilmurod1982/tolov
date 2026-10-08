import { useT } from "../hooks/useT";

const METHOD_KEYS = {
  cash: "cash",
  card: "card",
  qr: "qr",
};

export default function PaymentCard({ p }) {
  const t = useT();

  const time =
    p.createdAt?.toDate?.().toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }) ?? "—";

  const methodLabel = t(METHOD_KEYS[p.method] || "cash");
  const acceptedBy =
    p.source === "operator"
      ? `${t("roleOperator")}: ${p.operatorName || "—"}`
      : `${t("roleAttendant")}: ${p.attendantName || "—"}`;

  const sourceBadge =
    p.source === "operator" ? (
      <span
        className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-purple-700
                       dark:bg-purple-900/40 dark:text-purple-300"
      >
        {t("colCashBadge")}
      </span>
    ) : (
      <span
        className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-blue-700
                       dark:bg-blue-900/40 dark:text-blue-300"
      >
        {t("column")}
      </span>
    );

  return (
    <div className="card flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("column")} №{p.columnId ?? "—"}
          </span>
          {sourceBadge}
        </div>
        <div className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
          {acceptedBy}
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500">
          {methodLabel} · {time}
          {p.vehicleNumber ? ` · ${p.vehicleNumber}` : ""}
        </div>
      </div>

      <div className="text-right">
        <div className="whitespace-nowrap text-lg font-bold text-brand-700 dark:text-brand-400">
          {Number(p.amount || 0).toLocaleString("ru-RU")} {t("sum")}
        </div>
        {p.volume > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {p.volume} м³
          </div>
        )}
      </div>
    </div>
  );
}
