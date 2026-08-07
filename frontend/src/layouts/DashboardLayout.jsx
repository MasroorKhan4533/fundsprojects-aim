import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>FundsProjects AIM</h2>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
