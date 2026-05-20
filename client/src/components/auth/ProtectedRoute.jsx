import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
