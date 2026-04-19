import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useInactivityLogout } from "../hooks/useInactivityLogout";
import { useAuth } from "../hooks/useAuth";
import InactivityWarningModal from "../components/InactivityWarningModal";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import Orders from "../pages/Orders";
import Users from "../pages/Users";
import Settings from "../pages/Settings";
import ForgotPassword from "../pages/ForgotPassword";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutesContent() {
  const { showWarning, countdown, handleExtendSession } = useInactivityLogout();
  const { logout } = useAuth();

  return (
    <>
      <InactivityWarningModal
        isOpen={showWarning}
        countdown={countdown}
        onExtend={handleExtendSession}
        onLogout={logout}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Home />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
       
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function AppRoutes() {
  return (
    <Router>
      <AppRoutesContent />
    </Router>
  );
}
