import { useToastStore } from "../store/toastStore";

const styles = {
  success: "bg-green-600 text-white dark:bg-green-500",
  error: "bg-red-600 text-white dark:bg-red-500",
  info: "bg-gray-800 text-white dark:bg-gray-700",
  warning: "bg-yellow-500 text-white dark:bg-yellow-400",
};

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:w-auto">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => remove(t.id)}
          className={`pointer-events-auto cursor-pointer rounded-lg px-4 py-3 text-sm shadow-lg transition
                      ${styles[t.type] || styles.info}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
