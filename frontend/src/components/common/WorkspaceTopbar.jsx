import { Link, useLocation, useNavigate } from "react-router-dom";
import AppIcon from "../ui/AppIcon";
import Button from "../ui/Button";
import { getNavigationMeta } from "../../constants/navigation";
import { useLogout } from "../../features/auth/hooks/useAuth";

const initialsFor = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U";

function WorkspaceTopbar({ user, onMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();
  const meta = getNavigationMeta(location.pathname);

  const handleLogout = () => logout.mutate(undefined, { onSettled: () => navigate("/login", { replace: true }) });

  return (
    <header className="workspace-topbar">
      <button className="icon-button mobile-nav-toggle" type="button" onClick={onMenu} aria-label="Open navigation"><AppIcon name="menu" /></button>
      <div className="workspace-page-title">
        <h2>{meta.title}</h2>
        <p>{meta.subtitle}</p>
      </div>
      <div className="workspace-topbar-spacer" />
      <Link className="workspace-user" to="/app/profile" aria-label="Open my profile">
        <span className="workspace-avatar">{initialsFor(user?.fullName)}</span>
        <span className="workspace-user-copy"><strong>{user?.fullName}</strong><small>{user?.userId} · {user?.role}</small></span>
      </Link>
      <Button variant="ghost" size="sm" leadingIcon="logout" onClick={handleLogout} loading={logout.isPending}>Logout</Button>
    </header>
  );
}

export default WorkspaceTopbar;
