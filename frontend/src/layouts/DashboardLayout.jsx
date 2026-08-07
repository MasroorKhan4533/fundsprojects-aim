import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../features/auth/hooks/useAuth";
import { useLogout } from "../features/auth/hooks/useLogout";

/*
  Main authenticated application layout.
*/

function DashboardLayout() {
  const navigate = useNavigate();
  const { data } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    isActive ? "active" : "";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            <div className="brand-mark">AIM</div>

            <div>
              <strong>FundsProjects</strong>
              <small>Sales Operations</small>
            </div>
          </div>

          <nav className="sidebar-nav">
            <NavLink
              to="/"
              end
              className={linkClass}
            >
              AIM Master Dashboard
            </NavLink>

            <NavLink
              to="/leads"
              className={linkClass}
            >
              A — Master Leads
            </NavLink>

            <NavLink
              to="/c1"
              className={linkClass}
            >
              I — C1 Connect
            </NavLink>

            <NavLink
              to="/c2"
              className={linkClass}
            >
              I — C2 Clarity
            </NavLink>

            <NavLink
              to="/c3"
              className={linkClass}
            >
              M — C3 Solution & Commercial
            </NavLink>

            <NavLink
              to="/c4"
              className={linkClass}
            >
              M — C4 Closure
            </NavLink>

            <NavLink
              to="/won"
              className={linkClass}
            >
              Won Deals
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-user">
          <strong>
            {data?.user?.fullName}
          </strong>

          <span>
            {data?.user?.role}
          </span>

          <button
            onClick={handleLogout}
            className="secondary-button"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
