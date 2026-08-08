import { Link, Outlet, useNavigate, useOutletContext } from "react-router-dom";
import Button from "../components/ui/Button";
import { useLogout } from "../features/auth/hooks/useAuth";
function SecureLayout() {
  const { user } = useOutletContext();
  const logout = useLogout();
  const navigate = useNavigate();
  return <div className="secure-shell"><header className="secure-header"><Link to="/app" className="brand-link">FundsProjects AIM</Link><nav><Link to="/app">Workspace</Link>{user.role === "ADMIN" ? <Link to="/admin/users">User Management</Link> : null}</nav><div className="secure-user"><div><strong>{user.fullName}</strong><small>{user.userId} · {user.role}</small></div><Button variant="secondary" onClick={() => logout.mutate(undefined, { onSettled: () => navigate("/login", { replace: true }) })}>Logout</Button></div></header><Outlet context={{ user }} /></div>;
}
export default SecureLayout;
