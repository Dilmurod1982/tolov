import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { logout } from "../firebase/auth";
import { useUiStore } from "../store/uiStore";
import { useT } from "../hooks/useT";

const roleLabelKey = {
  admin: "roleAdmin",
  operator: "roleOperator",
  attendant: "roleAttendant",
};

export default function Layout({ children }) {
  const { profile } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();
  const { sidebarOpen, toggleSidebar, closeSidebar } = useUiStore();
  const t = useT();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-brand-600 text-white"
        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
    }`;

  const navItems = [
    { to: "/", label: t("home"), show: true },
    { to: "/admin/users", label: t("users"), show: profile?.role === "admin" },
    {
      to: "/admin/stations",
      label: t("stationsTitle"),
      show: profile?.role === "admin",
    },
    {
      to: "/admin/accounting",
      label: t("accounting"),
      show: profile?.role === "admin",
    },
    {
      to: "/operator/accounting",
      label: t("accounting"),
      show: profile?.role === "operator",
    },
    { to: "/statistics", label: t("statistics"), show: true },
    { to: "/profile", label: t("profile"), show: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-3 py-3 shadow-sm
                         dark:border-gray-700 dark:bg-gray-800 sm:px-4"
      >
        <div className="flex items-center gap-2">
          <button
            className="rounded p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 md:hidden"
            onClick={toggleSidebar}
            aria-label="Menu"
          >
            ☰
          </button>
          <span className="text-lg font-semibold text-brand-700 dark:text-brand-400">
            {t("appName")}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggle}
            title={t("theme")}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200
                       dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {profile?.fullName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t(roleLabelKey[profile?.role] || "roleAttendant")}
            </div>
          </div>

          <button onClick={handleLogout} className="btn-secondary text-sm">
            {t("logout")}
          </button>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white p-4 shadow-md transition-transform
                      dark:bg-gray-800 dark:shadow-none md:static md:translate-x-0 ${
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                      }`}
        >
          <nav className="mt-14 space-y-1 md:mt-0">
            {navItems
              .filter((i) => i.show)
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={linkClass}
                  onClick={closeSidebar}
                >
                  {item.label}
                </NavLink>
              ))}
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={closeSidebar}
          />
        )}

        <main className="min-h-[calc(100vh-57px)] flex-1 p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
