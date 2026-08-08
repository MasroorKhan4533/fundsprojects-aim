import { useOutletContext } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import PageHeader from "../../../components/ui/PageHeader";

function ProfilePage() {
  const { user } = useOutletContext();
  return (
    <main className="app-page">
      <PageHeader eyebrow="My Workspace" title="My Profile" subtitle="Personal performance, targets, pipeline, commission and upcoming work." actions={<Badge tone="success">{user.status}</Badge>} />
      <div className="profile-foundation-grid">
        <Card><span className="eyebrow">Identity</span><h3>{user.fullName}</h3><dl className="profile-details"><div><dt>User ID</dt><dd>{user.userId}</dd></div><div><dt>Designation</dt><dd>{user.designation}</dd></div><div><dt>System Role</dt><dd>{user.role}</dd></div><div><dt>Email</dt><dd>{user.email}</dd></div></dl></Card>
        <Card><span className="eyebrow">Phase 7</span><h3>Performance workspace ready</h3><p className="muted">Targets, pipeline, commissions, upcoming work and exports will bind here after operational modules are live.</p></Card>
      </div>
    </main>
  );
}
export default ProfilePage;
