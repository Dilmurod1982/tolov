import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useTodayPayments } from "../../hooks/useTodayPayments";
import {
  createOperatorPayment,
  acknowledgePayment,
  unacknowledgePayment,
} from "../../firebase/firestore";
import StatCard from "../../components/StatCard";
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

export default function Accounting() {
  const { user, profile, station } = useAuthStore();
  const { items, loading } = useTodayPayments(profile?.stationId);
  const t = useT();

  /* ------------------------------------------------------------
   * Только админ может создавать оплаты.
   * Оператор работает в режиме просмотра + отметки «принято».
   * ------------------------------------------------------------ */
  const canCreate = profile?.role === "admin";

  const [soundOn, setSoundOn] = useState(true);
  const [modalColumn, setModalColumn] = useState(null);
  const [amountDigits, setAmountDigits] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ackBusy, setAckBusy] = useState({});

  const prevCount = useRef(items.length);

  useEffect(() => {
    if (!soundOn) return;
    if (items.length > prevCount.current) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.value = 0.1;
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } catch (e) {
        /* noop */
      }
    }
    prevCount.current = items.length;
  }, [items.length, soundOn]);

  const columns = useMemo(() => {
    const count = Number(station?.columns) || 0;
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [station]);

  const columnTotals = useMemo(() => {
    const m = new Map();
    for (const p of items) {
      const key = String(p.columnId);
      m.set(key, (m.get(key) || 0) + (p.amount || 0));
    }
    return m;
  }, [items]);

  const stats = useMemo(() => {
    let total = 0,
      cash = 0,
      card = 0,
      qr = 0,
      volume = 0,
      ack = 0;
    for (const p of items) {
      total += p.amount || 0;
      volume += p.volume || 0;
      if (p.method === "cash") cash += p.amount || 0;
      else if (p.method === "card") card += p.amount || 0;
      else if (p.method === "qr") qr += p.amount || 0;
      if (p.acknowledged) ack += 1;
    }
    return { total, cash, card, qr, volume, ack };
  }, [items]);

  const fmt = (n) => Number(n || 0).toLocaleString("ru-RU");

  const openModal = (col) => {
    if (!canCreate) return;
    setModalColumn(col);
    setAmountDigits("");
    setError("");
  };

  const closeModal = () => {
    setModalColumn(null);
    setAmountDigits("");
    setError("");
  };

  const onAmountChange = (e) => {
    setAmountDigits(sanitizeDigits(e.target.value));
  };

  const amountNum = Number(amountDigits);
  const canSubmit = !busy && amountNum > 0 && canCreate;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setBusy(true);
    setError("");
    const col = modalColumn;
    const amt = amountNum;
    try {
      await createOperatorPayment({
        stationId: profile.stationId,
        columnId: col,
        operatorId: user.uid,
        operatorName: profile.fullName,
        amount: amt,
      });
      toast(
        `${t("save")} ✓ — ${amt.toLocaleString("ru-RU")} ${t("sum")}, ${t(
          "column"
        )} №${col}`,
        "success"
      );
      closeModal();
    } catch (err) {
      console.error(err);
      setError(err.message || t("paymentError"));
      toast(err.message || t("paymentError"), "error", 5000);
    } finally {
      setBusy(false);
    }
  };

  const toggleAck = async (p) => {
    setAckBusy((s) => ({ ...s, [p.id]: true }));
    try {
      if (p.acknowledged) {
        await unacknowledgePayment(p.id);
      } else {
        await acknowledgePayment(p.id, {
          uid: user.uid,
          fullName: profile.fullName,
          email: profile.email,
        });
      }
    } catch (err) {
      console.error(err);
      toast(err.message || "Xatolik", "error");
    } finally {
      setAckBusy((s) => {
        const next = { ...s };
        delete next[p.id];
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t("accountingTitle")}
        </h1>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={soundOn}
            onChange={(e) => setSoundOn(e.target.checked)}
          />
          {t("sound")}
        </label>
      </div>

      {/* Кнопки колонок — только для админа */}
      {canCreate && (
        <div className="card">
          <div className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("quickPay")}
          </div>

          {columns.length === 0 ? (
            <div
              className="rounded bg-yellow-50 p-2 text-sm text-yellow-800
                            dark:bg-yellow-900/30 dark:text-yellow-200"
            >
              {t("noColumnsHint", { sid: profile?.stationId })}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {columns.map((col) => {
                const sum = columnTotals.get(String(col)) || 0;
                return (
                  <button
                    key={col}
                    onClick={() => openModal(col)}
                    className="flex aspect-square flex-col items-center justify-center rounded-xl
                               bg-brand-600 text-white shadow transition hover:bg-brand-700
                               active:scale-95"
                  >
                    <span className="text-3xl font-bold leading-none">
                      {col}
                    </span>
                    <span className="mt-2 text-[11px] opacity-90">
                      {sum > 0 ? fmt(sum) : t("column")}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Сводка */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label={t("paymentsCount")} value={items.length} />
        <StatCard label={t("total")} value={fmt(stats.total)} accent="green" />
        <StatCard label={t("cash")} value={fmt(stats.cash)} />
        <StatCard
          label={`${t("card")} / ${t("qr")}`}
          value={fmt(stats.card + stats.qr)}
        />
        <StatCard
          label={t("acknowledged")}
          value={`${stats.ack} / ${items.length}`}
          accent="gray"
        />
      </div>

      {/* Таблица оплат */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
          {t("onlineFeed")}
        </h2>

        {loading ? (
          <div className="text-gray-500 dark:text-gray-400">{t("loading")}</div>
        ) : items.length === 0 ? (
          <div className="card text-gray-500 dark:text-gray-400">
            {t("noPayments")}
          </div>
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="min-w-full text-sm">
              <thead
                className="bg-gray-50 text-left text-xs uppercase text-gray-500
                                dark:bg-gray-700 dark:text-gray-300"
              >
                <tr>
                  <th className="px-3 py-2">{t("date")}</th>
                  <th className="px-3 py-2">{t("time")}</th>
                  <th className="px-3 py-2">{t("columnShort")}</th>
                  <th className="px-3 py-2">{t("source")}</th>
                  <th className="px-3 py-2">{t("acceptedBy")}</th>
                  <th className="px-3 py-2 text-right">{t("sum")}</th>
                  <th className="px-3 py-2 text-center">{t("acknowledged")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {items.map((p) => {
                  const d = p.createdAt?.toDate?.() ?? new Date();
                  const isOperator = p.source === "operator";
                  const acceptedBy = isOperator
                    ? p.operatorName || "—"
                    : p.attendantName || "—";
                  const isAck = !!p.acknowledged;
                  const isBusy = !!ackBusy[p.id];

                  return (
                    <tr
                      key={p.id}
                      className={
                        isAck ? "bg-green-50/50 dark:bg-green-900/10" : ""
                      }
                    >
                      <td className="whitespace-nowrap px-3 py-2 text-gray-800 dark:text-gray-100">
                        {d.toLocaleDateString("ru-RU")}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-800 dark:text-gray-100">
                        {d.toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                        {p.columnId ?? "—"}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs ${
                            isOperator
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                          }`}
                        >
                          {isOperator ? t("colCashBadge") : t("columnShort")}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                        {acceptedBy}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-gray-50">
                        {fmt(p.amount)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <label className="inline-flex cursor-pointer items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isAck}
                            disabled={isBusy}
                            onChange={() => toggleAck(p)}
                            className="h-5 w-5 cursor-pointer rounded border-gray-300 text-brand-600
                                       focus:ring-brand-500 dark:border-gray-500 dark:bg-gray-700"
                          />
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модалка суммы — только для админа */}
      {canCreate && modalColumn !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm space-y-4 rounded-xl bg-white p-5 shadow-xl dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t("column")} №{modalColumn}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="label">{t("amountLabel")}</label>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                autoComplete="off"
                className="input text-2xl"
                value={formatDigits(amountDigits)}
                onChange={onAmountChange}
                placeholder="0"
              />
            </div>

            {error && (
              <div className="rounded bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                className="btn-secondary flex-1"
                onClick={closeModal}
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="btn-success flex-1"
                disabled={!canSubmit}
              >
                {busy ? t("loading") : t("save")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
