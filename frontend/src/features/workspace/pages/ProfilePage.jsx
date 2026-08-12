import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import PageHeader from "../../../components/ui/PageHeader";
import StatCard from "../../../components/ui/StatCard";
import { useIntegrationCapabilities } from "../../integrations/hooks/useIntegrations";
import { useMyProfile } from "../../profile/hooks/useProfile";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
const when = (value) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

function ProfilePage() {
  const profileQuery = useMyProfile();
  const capabilitiesQuery = useIntegrationCapabilities();
  const profile = profileQuery.data?.data?.profile;
  const capabilities = capabilitiesQuery.data?.data?.capabilities;

  if (profileQuery.isLoading) return <main className="app-page"><PageHeader eyebrow="My Workspace" title="My Profile" subtitle="Loading personal performance workspace…" /></main>;
  if (profileQuery.error) return <main className="app-page"><PageHeader eyebrow="My Workspace" title="My Profile" subtitle={profileQuery.error.message} /></main>;

  return (
    <main className="app-page phase7-profile-page">
      <PageHeader eyebrow="My Workspace" title="My Profile" subtitle="Personal performance, targets, pipeline, commission and upcoming work." actions={<Badge tone="success">{profile?.identity?.status}</Badge>} />

      <div className="profile-foundation-grid">
        <Card><span className="eyebrow">Identity</span><h3>{profile?.identity?.fullName}</h3><dl className="profile-details"><div><dt>User ID</dt><dd>{profile?.identity?.userId}</dd></div><div><dt>Designation</dt><dd>{profile?.identity?.designation}</dd></div><div><dt>System Role</dt><dd>{profile?.identity?.role}</dd></div><div><dt>Email</dt><dd>{profile?.identity?.email}</dd></div><div><dt>Mobile</dt><dd>{profile?.identity?.mobile}</dd></div><div><dt>Last Login</dt><dd>{when(profile?.identity?.lastLoginAt)}</dd></div></dl></Card>
        <Card><span className="eyebrow">Integration Readiness</span><h3>Operational adapters</h3><div className="phase7-capability-list">{capabilities ? Object.entries(capabilities).map(([key, value]) => <div key={key}><strong>{key}</strong><Badge tone="info">{value.status || value.mode || "READY"}</Badge></div>) : <span className="muted">Loading integration readiness…</span>}</div></Card>
      </div>

      <div className="phase7-profile-stats">
        <StatCard label="Lead Actual" value={profile?.actuals?.leads ?? 0} helper={`Target ${profile?.targets?.leads ?? 0}`} />
        <StatCard label="C1 / C2" value={`${profile?.actuals?.c1 ?? 0} / ${profile?.actuals?.c2 ?? 0}`} helper="Communication journey" />
        <StatCard label="C3 / C4" value={`${profile?.actuals?.c3 ?? 0} / ${profile?.actuals?.c4 ?? 0}`} helper="Commercial journey" />
        <StatCard label="Won Revenue" value={money(profile?.actuals?.revenue)} helper={`${profile?.pipeline?.buildHandoffs ?? 0} BUILD handovers`} />
        <StatCard label="Open Pipeline" value={money(profile?.pipeline?.openValue)} helper={`Weighted ${money(profile?.pipeline?.weightedValue)}`} />
        <StatCard label="Commission" value={money(profile?.commission?.total)} helper={`${profile?.commission?.wonDeals ?? 0} won deals`} />
      </div>

      <div className="phase7-profile-grid">
        <Card><div className="section-card-head"><h2>Upcoming Work</h2><p>Next actions linked to your permanent leads.</p></div><div className="phase7-upcoming-list">{(profile?.upcoming || []).map((item) => <div key={item.id}><div><strong>{item.companyName}</strong><span>{item.permanentLeadId}</span></div><div><strong>{item.nextAction}</strong><span>{when(item.nextFollowUpDate)}</span></div></div>)}{!(profile?.upcoming || []).length ? <p className="muted">No upcoming follow-ups.</p> : null}</div></Card>
        <Card><div className="section-card-head"><h2>Commission Schedule</h2><p>Derived from Won deals and the current deal commission rules.</p></div><div className="phase7-commission-list">{(profile?.commission?.rows || []).map((row) => <div key={row.permanentLeadId}><span>{row.permanentLeadId}</span><strong>{money(row.total)}</strong><small>{row.rate}% · {row.payoutMonths} months</small></div>)}{!(profile?.commission?.rows || []).length ? <p className="muted">No won-deal commission yet.</p> : null}</div></Card>
      </div>
    </main>
  );
}
export default ProfilePage;
