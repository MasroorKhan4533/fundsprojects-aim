import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import ConfirmationDialog from "../../../components/ui/ConfirmationDialog";
import DataTable from "../../../components/ui/DataTable";
import PageHeader from "../../../components/ui/PageHeader";
import Select from "../../../components/ui/Select";
import StatCard from "../../../components/ui/StatCard";
import { useUsers } from "../../users/hooks/useUsers";
import TargetForm from "../../targets/components/TargetForm";
import { useCreateTarget, useDeleteTarget, useTargets, useUpdateTarget } from "../../targets/hooks/useTargets";
import { useAimDashboard } from "../../dashboard/hooks/useAimDashboard";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
const number = (value) => new Intl.NumberFormat("en-IN").format(value || 0);

function TargetSheetPage() {
  const { user } = useOutletContext();
  const [editing, setEditing] = useState(null); const [deleting, setDeleting] = useState(null); const [owner, setOwner] = useState("");
  const params = useMemo(() => ({ page: 1, limit: 50, assignedTo: user.role === "ADMIN" ? owner : user.id }), [owner, user]);
  const targets = useTargets(params); const dashboard = useAimDashboard({ assignedTo: params.assignedTo });
  const users = useUsers({ page: 1, limit: 100, status: "ACTIVE" }, { enabled: user.role === "ADMIN" });
  const createTarget = useCreateTarget(); const updateTarget = useUpdateTarget(); const deleteTarget = useDeleteTarget();
  const activeUsers = users.data?.data || []; const rows = targets.data?.data || []; const totals = dashboard.data?.data?.targets || {};
  const save = async (body) => { if (editing) await updateTarget.mutateAsync({ id: editing.id, body }); else await createTarget.mutateAsync(body); setEditing(null); };
  const columns = [
    { key:"targetDate", header:"Date" }, { key:"user", header:"User", render:(row)=><><strong>{row.assignedTo.fullName}</strong><small className="table-subtext">{row.assignedTo.userId}</small></> }, { key:"focusStage", header:"Focus", render:(row)=><Badge tone="info">{row.focusStage}</Badge> },
    ...[["leads","Leads"],["emails","Emails"],["messages","WhatsApp"],["calls","Calls"],["meetings","Meetings"],["c1","C1"],["c2","C2"],["c3","C3"],["c4","C4"],["proposals","Proposals"]].map(([key,header])=>({key,header,render:(row)=>number(row.metrics[key])})),
    { key:"revenue", header:"Revenue", render:(row)=>money(row.metrics.revenue) }, { key:"actions", header:"Actions", render:(row)=>user.role === "ADMIN" ? <div className="row-actions"><Button size="sm" variant="secondary" onClick={()=>setEditing(row)}>Edit</Button><Button size="sm" variant="danger" onClick={()=>setDeleting(row)}>Delete</Button></div> : <Badge tone="neutral">Read only</Badge> },
  ];
  return <div className="app-page">
    <PageHeader eyebrow="AIM • Targets" title="Target Sheet" subtitle="Date-wise CTA, stage and revenue targets with actual achievement." actions={user.role === "ADMIN" ? <div className="target-owner-filter"><Select id="target-owner" label="Team member" value={owner} onChange={(e)=>setOwner(e.target.value)}><option value="">All active users</option>{activeUsers.map((item)=><option key={item.id} value={item.id}>{item.fullName}</option>)}</Select></div> : null} />
    <div className="target-stat-grid">{[["Lead Target",number(totals.leads)],["Email Target",number(totals.emails)],["WhatsApp Target",number(totals.messages)],["Call Target",number(totals.calls)],["Meeting Target",number(totals.meetings)],["C1 Target",number(totals.c1)],["C2 Target",number(totals.c2)],["C3 Target",number(totals.c3)],["C4 Target",number(totals.c4)],["Proposal Target",number(totals.proposals)],["Revenue Target",money(totals.revenue)]].map(([label,value])=><StatCard key={label} label={label} value={value} helper="Selected scope" />)}</div>
    <div className="target-layout"><Card><div className="section-card-head"><div><span className="eyebrow">{user.role === "ADMIN" ? "CREATE / EDIT" : "MY TARGETS"}</span><h2>Daily / Date-wise Target</h2><p>{user.role === "ADMIN" ? "Targets are persisted in MongoDB and tied to active internal users." : "Your assigned targets are read-only. Administrators manage target allocation."}</p></div></div>{user.role === "ADMIN" ? <TargetForm users={activeUsers} editing={editing} currentUser={user} onSubmit={save} onCancel={()=>setEditing(null)} busy={createTarget.isPending || updateTarget.isPending} /> : <div className="readiness-list"><div><Badge tone="info">READ ONLY</Badge><strong>Target allocation is managed by administrators.</strong></div></div>}</Card><Card><div className="section-card-head"><span className="eyebrow">ACHIEVEMENT CONTRACT</span><h2>Actual vs Target</h2><p>Target totals are live now. Actual lead, activity and revenue values will populate automatically when A, I and M domain modules are installed in Phases 4–6.</p></div><div className="readiness-list"><div><Badge tone="success">LIVE</Badge><strong>Target persistence</strong></div><div><Badge tone="warning">PHASE 4</Badge><strong>Lead actuals</strong></div><div><Badge tone="warning">PHASE 5</Badge><strong>C1/C2 actuals</strong></div><div><Badge tone="warning">PHASE 6</Badge><strong>C3/C4 revenue</strong></div></div></Card></div>
    <Card className="target-register"><div className="section-card-head"><div><span className="eyebrow">REGISTER</span><h2>Target Register</h2><p>{targets.data?.meta?.total || 0} saved target record(s).</p></div></div><DataTable columns={columns} rows={rows} rowKey="id" loading={targets.isLoading} error={targets.error} onRetry={targets.refetch} emptyTitle="No targets yet" emptyDescription="Create the first date-wise target above." /></Card>
    <ConfirmationDialog open={Boolean(deleting)} title="Delete target?" description={deleting ? `${deleting.assignedTo.fullName} • ${deleting.targetDate} • ${deleting.focusStage}` : ""} confirmLabel="Delete Target" tone="danger" busy={deleteTarget.isPending} onCancel={()=>setDeleting(null)} onConfirm={async()=>{await deleteTarget.mutateAsync(deleting.id);setDeleting(null);}} />
  </div>;
}
export default TargetSheetPage;
