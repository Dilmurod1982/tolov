import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/Layout";

import Login from "../pages/Login";
import HomeRedirect from "../pages/HomeRedirect";
import Profile from "../pages/Profile";

import AdminDashboard from "../pages/admin/Dashboard";
import Users from "../pages/admin/Users";
import OperatorDashboard from "../pages/operator/Dashboard";
import AttendantDashboard from "../pages/attendant/Dashboard";
import Accounting from "../pages/shared/Accounting";
import Statistics from "../pages/shared/Statistics";

function withLayout(node) {
  return <Layout>{node}</Layout>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomeRedirect />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={<ProtectedRoute>{withLayout(<Profile />)}</ProtectedRoute>}
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              {withLayout(<AdminDashboard />)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              {withLayout(<Users />)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/accounting"
          element={
            <ProtectedRoute roles={["admin"]}>
              {withLayout(<Accounting />)}
            </ProtectedRoute>
          }
        />

        <Route
          path="/operator"
          element={
            <ProtectedRoute roles={["operator"]}>
              {withLayout(<OperatorDashboard />)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/accounting"
          element={
            <ProtectedRoute roles={["operator"]}>
              {withLayout(<Accounting />)}
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendant"
          element={
            <ProtectedRoute roles={["attendant"]}>
              {withLayout(<AttendantDashboard />)}
            </ProtectedRoute>
          }
        />

        <Route
          path="/statistics"
          element={
            <ProtectedRoute roles={["admin", "operator", "attendant"]}>
              {withLayout(<Statistics />)}
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
