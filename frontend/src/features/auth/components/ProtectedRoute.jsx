import { Navigate, Outlet, useLocation } from "react-router-dom";
import Spinner from "../../../components/ui/Spinner";
import { useCurrentUser } from "../hooks/useAuth";

function ProtectedRoute({ roles }) {
  const location = useLocation();
  const { data: user, isLoading, isError } = useCurrentUser();
  if (isLoading) return <main className="auth-center"><Spinner label="Checking secure session" /></main>;
  if (isError || !user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/app" replace />;
  return <Outlet context={{ user }} />;
}
export default ProtectedRoute;
