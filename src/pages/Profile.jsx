import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { changeUserPassword } from "../firebase/auth";
import { useT } from "../hooks/useT";
import { useThemeStore } from "../store/themeStore";

export default function Profile() {
  const { profile } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const t = useT();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }
    if (newPassword !== confirm) {
      setError(t("passwordsDontMatch"));
      return;
    }

    setBusy(true);
    try {
      await changeUserPassword(oldPassword, newPassword);
      setSuccess(t("passwordChanged"));
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      console.error(err);
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError(t("wrongOldPassword"));
      } else if (err.code === "auth/weak-password") {
        setError(t("passwordTooShort"));
      } else {
        setError(err.message || "Xatolik");
      }
    } finally {
      setBusy(false);
    }
  };

  const roleLabelKey = {
    admin: "roleAdmin",
    operator: "roleOperator",
    attendant: "roleAttendant",
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t("profileTitle")}
      </h1>

      {/* ---------- данные профиля ---------- */}
      <div className="card space-y-2">
        <Row label={t("fullName")} value={profile?.fullName} />
        <Row label={t("profileEmail")} value={profile?.email} />
        <Row
          label={t("profileRole")}
          value={t(roleLabelKey[profile?.role] || "roleAttendant")}
        />
        <Row label={t("profileStation")} value={profile?.stationId} />
        {profile?.columnId && (
          <Row label={t("profileColumn")} value={profile.columnId} />
        )}
      </div>

      {/* ---------- тема ---------- */}
      <div className="card space-y-3">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {t("theme")}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme("light")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
              theme === "light"
                ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                : "border-gray-300 dark:border-gray-600 dark:text-gray-200"
            }`}
          >
            ☀️ {t("themeLight")}
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
              theme === "dark"
                ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                : "border-gray-300 dark:border-gray-600 dark:text-gray-200"
            }`}
          >
            🌙 {t("themeDark")}
          </button>
        </div>
      </div>

      {/* ---------- смена пароля ---------- */}
      <form onSubmit={submit} className="card space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t("changePassword")}
        </h2>

        <div>
          <label className="label">{t("oldPassword")}</label>
          <input
            type="password"
            className="input"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <div>
          <label className="label">{t("newPassword")}</label>
          <input
            type="password"
            className="input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="label">{t("confirmPassword")}</label>
          <input
            type="password"
            className="input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="rounded bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded bg-green-50 p-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
            {success}
          </div>
        )}

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? t("loading") : t("changePassword")}
        </button>
      </form>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {value || "—"}
      </span>
    </div>
  );
}
