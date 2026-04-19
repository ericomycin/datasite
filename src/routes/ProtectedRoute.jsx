import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { BeatLoader } from "react-spinners";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
        <BeatLoader color="#4f46e5" size={10} />
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render protected component if user is authenticated
  return children;
}
