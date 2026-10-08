import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function HomeRedirect() {
  const { profile } = useAuthStore();
  if (!profile) return <Navigate to="/login" replace />;
  if (profile.role === "admin") return <Navigate to="/admin" replace />;
  if (profile.role === "operator") return <Navigate to="/operator" replace />;
  return <Navigate to="/attendant" replace />;
}
