export default function StatCard({ label, value, accent = "brand" }) {
  const colors = {
    brand: "text-brand-700 dark:text-brand-400",
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    gray: "text-gray-700 dark:text-gray-200",
  };
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-bold ${colors[accent]}`}>{value}</div>
    </div>
  );
}
