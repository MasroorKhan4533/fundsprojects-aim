import { NavLink } from "react-router-dom";
import AppIcon from "../ui/AppIcon";
import { ADMIN_NAV_ITEMS, WORKSPACE_NAV_ITEMS } from "../../constants/navigation";

function SidebarLink({ item, onNavigate }) {
  return (
    <NavLink to={item.to} onClick={onNavigate} className={({ isActive }) => `workspace-nav-link ${isActive ? "active" : ""}`.trim()}>
      <span className="workspace-nav-icon"><AppIcon name={item.icon} size={19} /></span>
      <span>{item.label}</span>
    </NavLink>
  );
}

function WorkspaceSidebar({ user, open = false, onNavigate, onClose }) {
  return (
    <>
      <button className={`workspace-backdrop ${open ? "open" : ""}`} type="button" onClick={onClose} aria-label="Close navigation" tabIndex={open ? 0 : -1} />
      <aside className={`workspace-sidebar ${open ? "open" : ""}`.trim()} aria-label="Primary workspace navigation">
        <div className="workspace-brand">
          <span className="workspace-logo">FP</span>
          <div><strong>FundsProjects</strong><small>AIM Operating System</small></div>
        </div>

        <div className="workspace-nav-section">
          <span className="workspace-nav-label">AIM Workspace</span>
          <nav className="workspace-nav">
            {WORKSPACE_NAV_ITEMS.map((item) => <SidebarLink key={item.key} item={item} onNavigate={onNavigate} />)}
          </nav>
        </div>

        {user?.role === "ADMIN" ? (
          <div className="workspace-nav-section workspace-admin-section">
            <span className="workspace-nav-label">Administration</span>
            <nav className="workspace-nav">
              {ADMIN_NAV_ITEMS.map((item) => <SidebarLink key={item.key} item={item} onNavigate={onNavigate} />)}
            </nav>
          </div>
        ) : null}

        <div className="workspace-side-foot">
          <strong>Connected Workflow</strong>
          <small>FundsMailer • Chatting • Calling / recording-ready • Document URLs • BUILD handover</small>
        </div>
      </aside>
    </>
  );
}

export default WorkspaceSidebar;
