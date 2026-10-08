import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { loginWithEmail } from "../firebase/auth";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useT } from "../hooks/useT";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const t = useT();

  if (user && profile) return <Navigate to="/" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await loginWithEmail(email.trim(), password);
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(t("loginError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow
                   dark:bg-gray-800"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-700 dark:text-brand-400">
            {t("appName")}
          </h1>
          <button
            type="button"
            onClick={toggle}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm
                       dark:bg-gray-700 dark:text-gray-100"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {t("loginTitle")}
        </p>

        <div>
          <label className="label">{t("email")}</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="label">{t("password")}</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="rounded bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? t("loading") : t("loginButton")}
        </button>
      </form>
    </div>
  );
}
