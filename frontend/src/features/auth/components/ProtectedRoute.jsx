import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({ children }) {
  const { data, isLoading, isError } = useAuth();

  if (isLoading) {
    return <div className="page-center">Checking authentication...</div>;
  }

  if (isError || !data?.user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
