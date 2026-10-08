import { useEffect, useState } from "react";
import {
  listStations,
  createStation,
  updateStation,
  deleteStation,
} from "../../firebase/firestore";
import { useT } from "../../hooks/useT";
import { toast } from "../../store/toastStore";

const emptyForm = {
  name: "",
  address: "",
  columns: "",
};

export default function Stations() {
  const t = useT();

  const [stations, setStations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = создание
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await listStations();
      // сортируем по имени
      data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setStations(data);
    } catch (err) {
      console.error(err);
      toast(err.message || "Xatolik", "error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({
      name: s.name || "",
      address: s.address || "",
      columns: s.columns != null ? String(s.columns) : "",
    });
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    const address = form.address.trim();
    const columns = Number(form.columns);

    if (!name) {
      setError(t("stationName") + " *");
      return;
    }
    if (!columns || columns <= 0 || !Number.isInteger(columns)) {
      setError(t("stationColumns") + " > 0");
      return;
    }

    setBusy(true);
    try {
      if (editingId) {
        await updateStation(editingId, { name, address, columns });
        toast(t("editStation") + " ✓", "success");
      } else {
        await createStation({ name, address, columns });
        toast(t("addStation") + " ✓", "success");
      }
      closeForm();
      await load();
    } catch (err) {
      console.error(err);
      setError(err.message || "Xatolik");
      toast(err.message || "Xatolik", "error", 5000);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (s) => {
    if (!confirm(t("confirmDeleteStation"))) return;
    try {
      await deleteStation(s.id);
      toast(t("deleteStation") + " ✓", "success");
      await load();
    } catch (err) {
      console.error(err);
      toast(err.message || "Xatolik", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t("stationsTitle")}
        </h1>
        <button
          className="btn-primary"
          onClick={showForm ? closeForm : openCreate}
        >
          {showForm ? t("cancel") : t("addStation")}
        </button>
      </div>

      {/* ---------- форма ---------- */}
      {showForm && (
        <form onSubmit={submit} className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {editingId ? t("editStation") : t("addStation")}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{t("stationName")}</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Gorgaz"
              />
            </div>

            <div>
              <label className="label">{t("stationColumns")}</label>
              <input
                type="number"
                min="1"
                step="1"
                className="input"
                value={form.columns}
                onChange={(e) => setForm({ ...form, columns: e.target.value })}
                required
                placeholder="10"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">{t("stationAddress")}</label>
              <input
                className="input"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Fargona sh."
              />
            </div>
          </div>

          {error && (
            <div
              className="rounded bg-red-50 p-2 text-sm text-red-700
                            dark:bg-red-900/30 dark:text-red-300"
            >
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={closeForm}>
              {t("cancel")}
            </button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? t("loading") : t("save")}
            </button>
          </div>
        </form>
      )}

      {/* ---------- таблица ---------- */}
      <div className="card overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead
            className="bg-gray-50 text-left text-xs uppercase text-gray-500
                            dark:bg-gray-700 dark:text-gray-300"
          >
            <tr>
              <th className="px-3 py-2">{t("stationName")}</th>
              <th className="px-3 py-2">{t("stationAddress")}</th>
              <th className="px-3 py-2 text-right">{t("stationColumns")}</th>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {stations.map((s) => (
              <tr key={s.id}>
                <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">
                  {s.name}
                </td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                  {s.address || "—"}
                </td>
                <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-100">
                  {Number(s.columns) || 0}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-gray-500 dark:text-gray-400">
                  {s.id}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    className="btn-secondary mr-2 text-xs"
                    onClick={() => openEdit(s)}
                  >
                    {t("editStation")}
                  </button>
                  <button
                    className="btn-danger text-xs"
                    onClick={() => remove(s)}
                  >
                    {t("deleteStation")}
                  </button>
                </td>
              </tr>
            ))}
            {stations.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-3 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  {t("noStations")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
