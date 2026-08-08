import { Navigate, useOutletContext } from "react-router-dom";

function RoleRoute({ roles, children }) {
  const { user } = useOutletContext();
  if (!roles.includes(user.role)) return <Navigate to="/app/aim-master" replace />;
  return children;
}

export default RoleRoute;
