import { useMemo, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { createPayment } from "../../firebase/firestore";
import { useTodayPayments } from "../../hooks/useTodayPayments";
import { useT } from "../../hooks/useT";
import { toast } from "../../store/toastStore";

function formatDigits(digits) {
  if (!digits) return "";
  return Number(digits).toLocaleString("ru-RU");
}

function sanitizeDigits(raw, maxLen = 12) {
  const digits = raw.replace(/\D/g, "");
  return digits.slice(0, maxLen);
}

export default function AttendantDashboard() {
  const { user, profile, station } = useAuthStore();
  const { items } = useTodayPayments(profile?.stationId);
  const t = useT();

  const [amountDigits, setAmountDigits] = useState("");
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [busy, setBusy] = useState(false);

  const columns = useMemo(() => {
    const count = Number(station?.columns) || 0;
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [station]);

  const myItems = useMemo(
    () => items.filter((p) => p.attendantId === user?.uid),
    [items, user?.uid]
  );

  const myTotal = useMemo(
    () => myItems.reduce((s, p) => s + (p.amount || 0), 0),
    [myItems]
  );

  const amountNum = Number(amountDigits);
  const canSubmit = !busy && amountNum > 0 && selectedColumn !== null;

  const onAmountChange = (e) => {
    setAmountDigits(sanitizeDigits(e.target.value));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setBusy(true);
    try {
      await createPayment({
        stationId: profile.stationId,
        columnId: selectedColumn,
        attendantId: user.uid,
        attendantName: profile.fullName,
        amount: amountNum,
        method: "cash",
      });

      toast(
        `${t("paymentAccepted")} — ${amountNum.toLocaleString("ru-RU")} ${t(
          "sum"
        )}, ${t("column")} №${selectedColumn}`,
        "success"
      );

      setAmountDigits("");
      setSelectedColumn(null);
    } catch (err) {
      console.error(err);
      toast(err.message || t("paymentError"), "error", 5000);
    } finally {
      setBusy(false);
    }
  };

  const fmt = (n) => Number(n || 0).toLocaleString("ru-RU");

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t("acceptPayment")}
        </h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {profile?.fullName}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("myPayments")}
          </div>
          <div className="text-2xl font-bold text-brand-700 dark:text-brand-400">
            {myItems.length}
          </div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("sum")}
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {fmt(myTotal)}
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="card space-y-4">
        <div>
          <label className="label">{t("amountLabel")}</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className="input text-2xl font-semibold tracking-wide"
            value={formatDigits(amountDigits)}
            onChange={onAmountChange}
            placeholder="0"
          />
        </div>

        <div>
          <label className="label">{t("pickColumn")}</label>

          {columns.length === 0 ? (
            <div
              className="rounded bg-yellow-50 p-2 text-sm text-yellow-800
                            dark:bg-yellow-900/30 dark:text-yellow-200"
            >
              {t("noColumns", { sid: profile?.stationId })}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {columns.map((col) => {
                const active = selectedColumn === col;
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColumn(col)}
                    className={`flex aspect-square items-center justify-center rounded-xl
                                text-2xl font-bold shadow-sm transition active:scale-95 ${
                                  active
                                    ? "bg-brand-600 text-white ring-2 ring-brand-300"
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 " +
                                      "dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                                }`}
                  >
                    {col}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedColumn !== null && amountNum > 0 && (
          <div
            className="rounded bg-blue-50 p-2 text-sm text-blue-800
                          dark:bg-blue-900/30 dark:text-blue-200"
          >
            {t("column")} №{selectedColumn} · {fmt(amountNum)} {t("sum")}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-success w-full py-3 text-lg"
        >
          {busy ? t("loading") : t("submit")}
        </button>
      </form>

      <div>
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
          {t("myPayments")}
        </h2>
        <div className="card divide-y divide-gray-100 dark:divide-gray-700">
          {myItems.slice(0, 5).map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between py-2 text-sm"
            >
              <span className="text-gray-700 dark:text-gray-300">
                {t("column")} №{p.columnId}
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {fmt(p.amount)} {t("sum")}
              </span>
            </div>
          ))}
          {myItems.length === 0 && (
            <div className="py-2 text-gray-500 dark:text-gray-400">
              {t("noPayments")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
