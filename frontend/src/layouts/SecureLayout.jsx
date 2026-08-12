import { Outlet, useOutletContext } from "react-router-dom";
import WorkspaceSidebar from "../components/common/WorkspaceSidebar";
import WorkspaceTopbar from "../components/common/WorkspaceTopbar";
import { useUiStore } from "../stores/ui.store";

function SecureLayout() {
  const { user } = useOutletContext();
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <div className="workspace-shell">
      <WorkspaceSidebar user={user} open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} onClose={() => setSidebarOpen(false)} />
      <div className="workspace-main">
        <WorkspaceTopbar user={user} onMenu={toggleSidebar} />
        <div className="workspace-content"><Outlet context={{ user }} /></div>
      </div>
    </div>
  );
}

export default SecureLayout;
