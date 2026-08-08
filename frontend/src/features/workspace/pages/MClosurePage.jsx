import { useMemo, useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import PageHeader from "../../../components/ui/PageHeader";
import Select from "../../../components/ui/Select";
import StatCard from "../../../components/ui/StatCard";
import { useCurrentUser } from "../../auth/hooks/useAuth";
import DealForm from "../../deals/components/DealForm";
import { useCreateHandover, useDealSummary, useDealWorkbench, useSaveC3, useSaveC4 } from "../../deals/hooks/useDeals";
import { useUsers } from "../../users/hooks/useUsers";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
const when = (value) => value ? new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—";
const tone = (status) => status === "WON" || status === "Won" ? "success" : status === "LOST" || status === "Lost" ? "danger" : status === "C4" ? "warning" : "info";

function MClosurePage() {
  const { data: currentUser } = useCurrentUser(); const isAdmin = currentUser?.role === "ADMIN"; const { data: usersResponse } = useUsers({ page: 1, limit: 100, status: "ACTIVE" }); const users = usersResponse?.data || [];
  const [filters, setFilters] = useState({ page: 1, limit: 25, search: "", assignedTo: "", dealStatus: "" }); const [modal, setModal] = useState(null); const [notice, setNotice] = useState("");
  const workbench = useDealWorkbench(filters); const summary = useDealSummary(isAdmin && filters.assignedTo ? { assignedTo: filters.assignedTo } : {}); const saveC3 = useSaveC3(); const saveC4 = useSaveC4(); const handover = useCreateHandover();
  const rows = workbench.data?.data || []; const meta = workbench.data?.meta || { page: 1, totalPages: 1 }; const stats = summary.data?.data?.summary || {};
  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: key === "page" ? value : 1 }));
  const openDeal = (lead, stage) => { setNotice(""); setModal({ lead, stage }); };
  const save = async (body) => { const fn = modal.stage === "C3" ? saveC3 : saveC4; await fn.mutateAsync({ leadId: modal.lead.id, body }); setModal(null); };
  const createHandover = async (lead) => { setNotice(""); try { await handover.mutateAsync(lead.id); setNotice(`BUILD handover created for ${lead.companyName}.`); } catch (error) { setNotice(error.message); } };
  const columns = useMemo(() => [
    { key: "lead", header: "Qualified Lead", render: (lead) => <div className="lead-company-cell"><strong>{lead.companyName}</strong><span>{lead.permanentLeadId} · {lead.industry || "—"} · {lead.city || "—"}</span></div> },
    { key: "stage", header: "Stage", render: (lead) => <Badge tone={tone(lead.salesStage)}>{lead.salesStage}</Badge> },
    { key: "budget", header: "Budget", render: (lead) => money(lead.deal?.budget || lead.estimatedBudget) },
    { key: "probability", header: "Probability", render: (lead) => `${lead.deal?.probability || 0}%` },
    { key: "proposal", header: "Proposal", render: (lead) => <div><strong>{lead.deal?.proposalStatus?.replaceAll("_", " ") || "Pending"}</strong>{lead.deal?.proposalVersion ? <span className="table-subtext">{lead.deal.proposalVersion}</span> : null}</div> },
    { key: "close", header: "Expected Close", render: (lead) => when(lead.deal?.expectedClose) },
    { key: "status", header: "Closure", render: (lead) => <Badge tone={tone(lead.deal?.dealStatus || lead.salesStage)}>{lead.deal?.dealStatus?.replaceAll("_", " ") || "Not started"}</Badge> },
    { key: "actions", header: "Actions", render: (lead) => <div className="row-actions deal-row-actions"><Button size="sm" variant="secondary" onClick={() => openDeal(lead, "C3")}>C3 Versions</Button><Button size="sm" onClick={() => openDeal(lead, "C4")}>C4 Closure</Button>{lead.deal?.proposalUrl ? <Button size="sm" variant="ghost" onClick={() => window.open(lead.deal.proposalUrl, "_blank", "noopener,noreferrer")}>Proposal</Button> : <Button size="sm" variant="ghost" onClick={() => openDeal(lead, "C3")}>Proposal</Button>}<Button size="sm" variant="ghost" disabled={Boolean(lead.handover)} onClick={() => createHandover(lead)}>{lead.handover ? "BUILD Created" : "BUILD"}</Button></div> },
  ], []);
  return <main className="app-page commercial-page">
    <PageHeader eyebrow="M · C3 & C4" title="M — C3 & C4 Closure" subtitle="Work directly from qualified leads with solution versions, proposal, negotiation, closure and BUILD handover actions." />
    <div className="commercial-stat-grid"><StatCard label="C3 Collaboration" value={stats.c3 ?? 0} helper="Solutions recorded" /><StatCard label="C4 Closure" value={stats.c4 ?? 0} helper="Closure records" /><StatCard label="Proposals" value={stats.proposals ?? 0} helper="Prepared/shared" /><StatCard label="Pipeline" value={money(stats.openValue)} helper={`${money(stats.weightedValue)} weighted`} /><StatCard label="Won Revenue" value={money(stats.wonRevenue)} helper="Closed-Won value" /><StatCard label="Active Deals" value={stats.activeDeals ?? 0} helper="Open opportunities" /><StatCard label="Avg Probability" value={`${stats.averageProbability ?? 0}%`} helper="Current confidence" /><StatCard label="BUILD Handoffs" value={stats.buildHandoffs ?? 0} helper="Delivery projects created" /></div>
    {notice ? <div className="commercial-notice">{notice}</div> : null}
    <Card><div className="section-card-head"><span className="eyebrow">DAILY C3 / C4 EXECUTION</span><h2>Opportunity & Closure Table</h2><p>Qualified leads from C2 appear automatically. The same permanent AIM lead ID continues through C3, C4 and BUILD.</p></div>
      <div className="commercial-filter-grid"><Input id="m-search" label="Search" placeholder="Company…" value={filters.search} onChange={(e) => setFilter("search", e.target.value)} />{isAdmin ? <Select id="m-owner" label="Owner" value={filters.assignedTo} onChange={(e) => setFilter("assignedTo", e.target.value)}><option value="">All owners</option>{users.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}</Select> : null}<Select id="m-status" label="Deal Status" value={filters.dealStatus} onChange={(e) => setFilter("dealStatus", e.target.value)}><option value="">All</option><option value="ACTIVE">Active</option><option value="WON">Won</option><option value="LOST">Lost</option><option value="ON_HOLD">On Hold</option><option value="CANCELLED">Cancelled</option></Select></div>
      <DataTable columns={columns} rows={rows} loading={workbench.isLoading || workbench.isFetching} error={workbench.error} onRetry={() => workbench.refetch()} emptyTitle="No qualified leads in M" emptyDescription="Move a lead to C3 from the I C2 journey first." />
      <div className="pagination-bar"><span>Page {meta.page || 1} of {meta.totalPages || 1}</span><div><Button variant="secondary" size="sm" disabled={(meta.page || 1) <= 1} onClick={() => setFilter("page", Math.max(1, filters.page - 1))}>Previous</Button><Button variant="secondary" size="sm" disabled={(meta.page || 1) >= (meta.totalPages || 1)} onClick={() => setFilter("page", filters.page + 1)}>Next</Button></div></div>
    </Card>
    <Modal open={Boolean(modal)} title={modal ? `${modal.stage} · ${modal.lead.permanentLeadId} · ${modal.lead.companyName}` : "Commercial Deal"} description={modal?.stage === "C3" ? "Solution versions, proposal and negotiation" : "Agreement, payment and customer closure"} onClose={() => setModal(null)} size="lg">{(saveC3.error || saveC4.error) ? <div className="inline-error">{(saveC3.error || saveC4.error).message}</div> : null}{modal ? <DealForm stage={modal.stage} lead={modal.lead} deal={modal.lead.deal} saving={saveC3.isPending || saveC4.isPending} onSave={save} onCancel={() => setModal(null)} /> : null}</Modal>
  </main>;
}
export default MClosurePage;
