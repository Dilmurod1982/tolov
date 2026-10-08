import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  listStations,
  listUsers,
  updateUser,
  deleteUserDoc,
} from "../../firebase/firestore";
import { createUserByAdmin } from "../../firebase/auth";
import { useT } from "../../hooks/useT";

const emptyForm = {
  email: "",
  password: "",
  fullName: "",
  role: "attendant",
  stationId: "",
  columnId: "",
};

export default function Users() {
  const { user, profile } = useAuthStore();
  const t = useT();

  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const [u, s] = await Promise.all([listUsers(), listStations()]);
    setUsers(u);
    setStations(s);
  };

  useEffect(() => {
    load().catch((e) => console.error(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (!form.stationId) throw new Error(t("pickStation"));
      const adminPassword = prompt(t("adminPasswordPrompt"));
      if (!adminPassword) throw new Error(t("cancel"));
      await createUserByAdmin(user.email, adminPassword, form);
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      console.error(err);
      setError(err.message || t("paymentError"));
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (u) => {
    await updateUser(u.uid, { active: !u.active });
    await load();
  };

  const removeUser = async (u) => {
    if (!confirm(`${t("delete")} ${u.fullName}?`)) return;
    await deleteUserDoc(u.uid);
    await load();
  };

  const roleLabelKey = {
    admin: "roleAdmin",
    operator: "roleOperator",
    attendant: "roleAttendant",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t("usersTitle")}
        </h1>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? t("cancel") : t("addUser")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{t("fullName")}</label>
              <input
                className="input"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">{t("email")}</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">{t("password")}</label>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="label">{t("role")}</label>
              <select
                className="input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="attendant">{t("roleAttendant")}</option>
                <option value="operator">{t("roleOperator")}</option>
                <option value="admin">{t("roleAdmin")}</option>
              </select>
            </div>

            <div>
              <label className="label">{t("station")}</label>
              <select
                className="input"
                value={form.stationId}
                onChange={(e) =>
                  setForm({ ...form, stationId: e.target.value })
                }
                required
              >
                <option value="">{t("pickStation")}</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {form.role === "attendant" && (
              <div>
                <label className="label">{t("column")}</label>
                <input
                  className="input"
                  value={form.columnId}
                  onChange={(e) =>
                    setForm({ ...form, columnId: e.target.value })
                  }
                  placeholder="1"
                />
              </div>
            )}
          </div>

          {error && (
            <div
              className="rounded bg-red-50 p-2 text-sm text-red-700
                            dark:bg-red-900/30 dark:text-red-300"
            >
              {error}
            </div>
          )}

          <button className="btn-primary" disabled={busy}>
            {busy ? t("creating") : t("createUser")}
          </button>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead
            className="bg-gray-50 text-left text-xs uppercase text-gray-500
                            dark:bg-gray-700 dark:text-gray-300"
          >
            <tr>
              <th className="px-3 py-2">{t("fullName")}</th>
              <th className="px-3 py-2">{t("email")}</th>
              <th className="px-3 py-2">{t("role")}</th>
              <th className="px-3 py-2">{t("columnShort")}</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {users.map((u) => (
              <tr key={u.uid}>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                  {u.fullName}
                </td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                  {u.email}
                </td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                  {t(roleLabelKey[u.role] || "roleAttendant")}
                </td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                  {u.columnId ?? "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    className="btn-secondary mr-2 text-xs"
                    onClick={() => toggleActive(u)}
                  >
                    {u.active ? t("disable") : t("enable")}
                  </button>
                  <button
                    className="btn-danger text-xs"
                    onClick={() => removeUser(u)}
                  >
                    {t("delete")}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-3 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  {t("noUsers")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
