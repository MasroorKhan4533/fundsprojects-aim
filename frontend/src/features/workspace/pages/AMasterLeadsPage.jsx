import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import ConfirmationDialog from "../../../components/ui/ConfirmationDialog";
import DataTable from "../../../components/ui/DataTable";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import PageHeader from "../../../components/ui/PageHeader";
import Select from "../../../components/ui/Select";
import StatCard from "../../../components/ui/StatCard";
import LeadForm from "../../leads/components/LeadForm";
import { useCreateLead, useDeleteLead, useLeadHistory, useLeadSummary, useLeads, useUpdateLead } from "../../leads/hooks/useLeads";
import { useCurrentUser } from "../../auth/hooks/useAuth";
import { useUsers } from "../../users/hooks/useUsers";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
const dateTime = (value) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
const toneForPriority = (value) => value === "High" ? "danger" : value === "Medium" ? "warning" : "neutral";
const toneForStage = (value) => value === "Won" ? "success" : value === "Lost" ? "danger" : "info";

function AMasterLeadsPage() {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";
  const { data: usersResponse } = useUsers({ page: 1, limit: 100, status: "ACTIVE" });
  const users = usersResponse?.data || [];
  const [filters, setFilters] = useState({ page: 1, limit: 25, search: "", salesStage: "", assignedTo: "", leadPriority: "", sortBy: "updatedAt", sortOrder: "desc" });
  const [editingLead, setEditingLead] = useState(null);
  const [deleteLead, setDeleteLead] = useState(null);
  const [historyLead, setHistoryLead] = useState(null);
  const list = useLeads(filters);
  const summary = useLeadSummary(isAdmin && filters.assignedTo ? { assignedTo: filters.assignedTo } : {});
  const history = useLeadHistory(historyLead?.id, { enabled: Boolean(historyLead) });
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const removeLead = useDeleteLead();

  const items = list.data?.data || [];
  const meta = list.data?.meta || { page: 1, total: 0, totalPages: 1 };
  const stats = summary.data?.data?.summary || {};
  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: key === "page" ? value : 1 }));

  const columns = useMemo(() => [
    { key: "id", header: "Lead", render: (lead) => <div className="lead-company-cell"><strong>{lead.companyName}</strong><span>{lead.permanentLeadId}</span></div> },
    { key: "contact", header: "Primary Contact", render: (lead) => <div><strong>{lead.primaryContact?.fullName || "—"}</strong><span className="table-subtext">{lead.primaryContact?.designation || ""}</span><span className="table-subtext">{lead.primaryContact?.mobile || lead.primaryContact?.email || "—"}</span></div> },
    { key: "industry", header: "Industry / Business", render: (lead) => <div>{lead.industry}<span className="table-subtext">{[lead.subSector, ...(lead.businessModels || []).slice(0, 2)].filter(Boolean).join(" · ")}</span></div> },
    { key: "location", header: "Location", render: (lead) => [lead.city, lead.state, lead.country].filter(Boolean).join(", ") || "—" },
    { key: "owner", header: "Owner", render: (lead) => <div>{lead.assignedTo?.fullName || "—"}<span className="table-subtext">{lead.assignedTo?.userId || ""}</span></div> },
    { key: "stage", header: "Stage", render: (lead) => <Badge tone={toneForStage(lead.salesStage)}>{lead.salesStage}</Badge> },
    { key: "priority", header: "Priority", render: (lead) => <div><Badge tone={toneForPriority(lead.leadPriority)}>{lead.leadPriority}</Badge><span className="table-subtext">Intent {lead.buyingIntentScore}/100</span></div> },
    { key: "budget", header: "Budget", render: (lead) => money(lead.estimatedBudget) },
    { key: "followup", header: "Next Follow-up", render: (lead) => <div>{dateTime(lead.nextFollowUpDate)}<span className="table-subtext">{lead.nextAction || "No next action"}</span></div> },
    { key: "actions", header: "Actions", render: (lead) => <div className="row-actions"><Button size="sm" variant="secondary" onClick={() => { setEditingLead(lead); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</Button><Button size="sm" variant="ghost" onClick={() => setHistoryLead(lead)}>History</Button><Button size="sm" variant="secondary" onClick={() => navigate(`/app/i-c1-c2?leadId=${lead.id}`)}>Open I</Button><Button size="sm" variant="ghost" onClick={() => navigate(`/app/m-c3-c4?leadId=${lead.id}`)}>Open M</Button><Button size="sm" variant="danger" onClick={() => setDeleteLead(lead)}>Archive</Button></div> },
  ], [navigate]);

  const saveLead = async (payload) => {
    if (editingLead) await updateLead.mutateAsync({ id: editingLead.id, body: payload });
    else await createLead.mutateAsync(payload);
    setEditingLead(null);
  };

  return (
    <main className="app-page lead-page">
      <PageHeader eyebrow="A · Master Lead Capture" title="A — Master Lead Data" subtitle="Capture each company once and store it as the permanent lead directory. The same permanent lead ID flows into I and M." actions={<Button leadingIcon="plus" onClick={() => { setEditingLead(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Add Lead</Button>} />

      <div className="lead-stat-grid">
        <StatCard label="Total Active Leads" value={stats.total ?? 0} helper={`${meta.total ?? 0} in current result set`} />
        <StatCard label="Estimated Lead Budget" value={money(stats.estimatedBudget)} helper="Active master leads" />
        <StatCard label="High Priority" value={stats.highPriority ?? 0} helper={`${stats.hot ?? 0} hot leads`} />
        <StatCard label="Average Buying Intent" value={`${stats.averageIntentScore ?? 0}/100`} helper={`${stats.dueFollowUps ?? 0} follow-ups due`} />
      </div>

      <Card className="lead-editor-card">
        <div className="section-card-head"><h2>{editingLead ? `Edit ${editingLead.permanentLeadId}` : "Add Master Lead"}</h2><p>Production data is stored in MongoDB. Saving here creates or updates one permanent lead record, not a stage-specific duplicate.</p></div>
        {(createLead.error || updateLead.error) ? <div className="inline-error">{(createLead.error || updateLead.error).message}</div> : null}
        <LeadForm lead={editingLead} users={users} isAdmin={isAdmin} saving={createLead.isPending || updateLead.isPending} onSave={saveLead} onCancelEdit={() => setEditingLead(null)} />
      </Card>

      <Card className="lead-register-card">
        <div className="lead-register-head"><div><h2>Master Lead Register</h2><p>Server-side pagination, search, filtering and sorting are used so thousands of leads are never loaded into the browser at once.</p></div><span className="lead-result-count">{meta.total ?? 0} records</span></div>
        <div className="lead-filter-grid">
          <Input id="leadSearch" label="Search" placeholder="Company, person, email, mobile, lead ID..." value={filters.search} onChange={(event) => setFilter("search", event.target.value)} />
          <Select id="leadStage" label="Stage" value={filters.salesStage} onChange={(event) => setFilter("salesStage", event.target.value)}><option value="">All stages</option>{["C1", "C2", "C3", "C4", "Won", "Lost"].map((value) => <option key={value}>{value}</option>)}</Select>
          <Select id="leadPriorityFilter" label="Priority" value={filters.leadPriority} onChange={(event) => setFilter("leadPriority", event.target.value)}><option value="">All priorities</option>{["High", "Medium", "Low"].map((value) => <option key={value}>{value}</option>)}</Select>
          {isAdmin ? <Select id="leadOwner" label="Owner" value={filters.assignedTo} onChange={(event) => setFilter("assignedTo", event.target.value)}><option value="">All owners</option>{users.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}</Select> : null}
          <Select id="leadSort" label="Sort" value={filters.sortBy} onChange={(event) => setFilter("sortBy", event.target.value)}><option value="updatedAt">Recently updated</option><option value="createdAt">Recently created</option><option value="companyName">Company</option><option value="estimatedBudget">Budget</option><option value="buyingIntentScore">Buying intent</option><option value="nextFollowUpDate">Next follow-up</option></Select>
          <Select id="leadOrder" label="Order" value={filters.sortOrder} onChange={(event) => setFilter("sortOrder", event.target.value)}><option value="desc">Descending</option><option value="asc">Ascending</option></Select>
        </div>
        <DataTable columns={columns} rows={items} loading={list.isLoading || list.isFetching} error={list.error} onRetry={() => list.refetch()} emptyTitle="No master leads found" emptyDescription="Create the first permanent A lead or change the current filters." />
        <div className="pagination-bar"><span>Page {meta.page || 1} of {meta.totalPages || 1}</span><div><Button variant="secondary" size="sm" disabled={(meta.page || 1) <= 1} onClick={() => setFilter("page", Math.max(1, filters.page - 1))}>Previous</Button><Button variant="secondary" size="sm" disabled={(meta.page || 1) >= (meta.totalPages || 1)} onClick={() => setFilter("page", filters.page + 1)}>Next</Button></div></div>
      </Card>

      <ConfirmationDialog open={Boolean(deleteLead)} title="Archive this master lead?" description={deleteLead ? `${deleteLead.permanentLeadId} · ${deleteLead.companyName} will be soft-deleted. Its permanent identity and audit history are retained.` : ""} confirmLabel="Archive Lead" busy={removeLead.isPending} onCancel={() => setDeleteLead(null)} onConfirm={async () => { await removeLead.mutateAsync(deleteLead.id); setDeleteLead(null); if (editingLead?.id === deleteLead.id) setEditingLead(null); }} />

      <Modal open={Boolean(historyLead)} title={historyLead ? `${historyLead.permanentLeadId} History` : "Lead History"} description="Immutable create/update/archive/restore history for this permanent lead." onClose={() => setHistoryLead(null)} size="lg">
        {history.isLoading ? <p>Loading history…</p> : history.error ? <p className="inline-error">{history.error.message}</p> : <div className="lead-history-list">{(history.data?.data?.history || []).map((item) => <div key={item.id} className="lead-history-item"><div><Badge tone={item.action === "SOFT_DELETED" ? "danger" : item.action === "CREATED" || item.action === "RESTORED" ? "success" : "info"}>{item.action}</Badge><strong>{item.actor?.fullName || "System user"}</strong></div><span>{dateTime(item.createdAt)}</span></div>)}</div>}
      </Modal>
    </main>
  );
}
export default AMasterLeadsPage;
