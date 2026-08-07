import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../features/auth/hooks/useAuth";
import { useLogout } from "../features/auth/hooks/useLogout";

function DashboardLayout() {
  const navigate = useNavigate();
  const { data } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/login");
  };

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
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              AIM Master Dashboard
            </NavLink>

            <NavLink
              to="/leads"
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              A — Master Leads
            </NavLink>

            <NavLink
              to="/c1"
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              I — C1 Connect
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-user">
          <strong>{data?.user?.fullName}</strong>
          <span>{data?.user?.role}</span>

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
