import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({
  children,
  allowedRoles = [],
  blockedRoles = [],
  redirectTo = "/",
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If blockedRoles is specified, block those roles (but allow unauthenticated)
  if (blockedRoles.length > 0) {
    if (isAuthenticated && blockedRoles.includes(user?.role)) {
      return <Navigate to={redirectTo} replace />;
    }
    return children;
  }

  // Standard allowedRoles behavior - requires authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;
