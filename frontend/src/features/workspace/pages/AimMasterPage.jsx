import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import PageHeader from "../../../components/ui/PageHeader";
import Select from "../../../components/ui/Select";
import StatCard from "../../../components/ui/StatCard";
import { useAimDashboard } from "../../dashboard/hooks/useAimDashboard";
import { useUsers } from "../../users/hooks/useUsers";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
const num = (value) => new Intl.NumberFormat("en-IN").format(value || 0);
const when = (value) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
function Progress({ label, actual, target }) { const pct = target > 0 ? Math.min(100, Math.round(actual / target * 100)) : 0; return <div className="aim-progress"><div><strong>{label}</strong><span>{num(actual)} / {num(target)} • {pct}%</span></div><div className="aim-progress-track"><span style={{ width: `${pct}%` }} /></div></div>; }

function AimMasterPage() {
  const { user } = useOutletContext(); const [owner, setOwner] = useState("");
  const users = useUsers({ page: 1, limit: 100, status: "ACTIVE" }, { enabled: user.role === "ADMIN" });
  const dashboard = useAimDashboard({ assignedTo: user.role === "ADMIN" ? owner : user.id });
  const data = dashboard.data?.data; const target = data?.targets || {}; const actual = data?.actuals || {}; const pipeline = data?.pipeline || {};
  return <div className="app-page">
    <PageHeader eyebrow="AIM • MASTER" title="AIM Master Dashboard" subtitle="A single operational view from lead entry to customer closure." actions={user.role === "ADMIN" ? <div className="target-owner-filter"><Select id="aim-owner" label="Team member" value={owner} onChange={(e) => setOwner(e.target.value)}><option value="">All active users</option>{(users.data?.data || []).map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}</Select></div> : null} />
    <div className="aim-readiness-strip"><Badge tone="success">A + TARGETS + C1/C2 + C3/C4 LIVE</Badge><span>Lead capture, communication, C1/C2, C3/C4 commercial actuals and won revenue are live from MongoDB.</span></div>
    <div className="aim-stat-grid"><StatCard label="Lead Target" value={num(target.leads)} helper={`${num(actual.leads)} actual`} /><StatCard label="C1 Connect" value={num(target.c1)} helper={`${num(actual.c1)} actual`} /><StatCard label="C2 Clarity" value={num(target.c2)} helper={`${num(actual.c2)} actual`} /><StatCard label="C3 Collaboration" value={num(target.c3)} helper={`${num(actual.c3)} actual`} /><StatCard label="C4 Closure" value={num(target.c4)} helper={`${num(actual.c4)} actual`} /><StatCard label="Proposal Target" value={num(target.proposals)} helper={`${num(actual.proposals)} actual`} /><StatCard label="Revenue Target" value={money(target.revenue)} helper={`${money(actual.revenue)} won`} /><StatCard label="Active Team" value={num(data?.team?.activeUsers)} helper="Internal active users" /></div>
    <div className="aim-dashboard-grid"><Card><div className="section-card-head"><span className="eyebrow">TARGET ACHIEVEMENT</span><h2>CTA & Stage Progress</h2><p>A through C4 actuals are live and derived from the same permanent lead journey.</p></div><div className="aim-progress-list">{[["Leads", "leads"], ["Emails", "emails"], ["WhatsApp", "messages"], ["Calls", "calls"], ["Meetings", "meetings"], ["C1", "c1"], ["C2", "c2"], ["C3", "c3"], ["C4", "c4"], ["Proposals", "proposals"]].map(([label, key]) => <Progress key={key} label={label} actual={actual[key] || 0} target={target[key] || 0} />)}</div></Card><Card><div className="section-card-head"><span className="eyebrow">LEAD MIX</span><h2>Top Industries</h2><p>Live sector distribution from A Master Leads.</p></div><div className="commercial-metrics">{(data?.sectorMix || []).length ? data.sectorMix.map((item) => <div key={item.industry}><span>{item.industry}</span><strong>{num(item.count)}</strong></div>) : <div><span>No leads captured yet</span><strong>0</strong></div>}</div><div className="section-card-head" style={{ marginTop: 20 }}><span className="eyebrow">COMMERCIAL</span><h2>Pipeline & Revenue</h2><p>C3/C4 pipeline, weighted value and won revenue are live from M.</p></div><div className="commercial-metrics"><div><span>Open Pipeline</span><strong>{money(pipeline.openValue)}</strong></div><div><span>Weighted Pipeline</span><strong>{money(pipeline.weightedValue)}</strong></div><div><span>Won Revenue</span><strong>{money(pipeline.wonRevenue)}</strong></div></div></Card></div>
    <Card className="aim-upcoming"><div className="section-card-head"><span className="eyebrow">UPCOMING WORK</span><h2>Lead Follow-ups</h2><p>A and I both update the permanent lead's next action and follow-up date.</p></div>{data?.upcoming?.length ? <div className="lead-history-list">{data.upcoming.map((item) => <div className="lead-history-item" key={item.id}><div><Badge tone="info">{item.permanentLeadId}</Badge><strong>{item.companyName}</strong><span className="table-subtext">{item.nextAction}</span></div><span>{when(item.nextFollowUpDate)}</span></div>)}</div> : <EmptyState compact title="No upcoming follow-ups" description="Plan a next action from A or record a C1/C2 activity with a follow-up date." />}</Card>
  </div>;
}
export default AimMasterPage;
