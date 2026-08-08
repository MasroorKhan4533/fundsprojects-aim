import { Outlet } from "react-router-dom";

function FoundationLayout() {
  return (
    <div className="foundation-shell">
      <nav className="foundation-nav">
        <div className="foundation-brand">
          <div className="foundation-logo">FR</div>
          <div>
            <strong>FundsProjects</strong>
            <small>AIM Operating System</small>
          </div>
        </div>
        <span className="environment-pill">LOCAL · PRODUCTION V1</span>
      </nav>
      <main><Outlet /></main>
    </div>
  );
}

export default FoundationLayout;
