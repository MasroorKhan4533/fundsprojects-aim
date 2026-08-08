import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import InteractionForm from "../../interactions/components/InteractionForm";
import { useCreateInteraction, useInteractionSummary, useInteractions, useJourney } from "../../interactions/hooks/useInteractions";
import { useLaunchIntegration } from "../../integrations/hooks/useIntegrations";
import { useLeads } from "../../leads/hooks/useLeads";
import { useUsers } from "../../users/hooks/useUsers";

const when = (value) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
const tone = (stage) => stage === "C1" ? "info" : stage === "C2" ? "warning" : stage === "C3" ? "success" : "neutral";
const openWhatsApp = (lead) => { const phone = String(lead.primaryContact?.whatsapp || lead.primaryContact?.mobile || "").replace(/\D/g, ""); if (phone) window.open(`https://wa.me/${phone}`, "_blank", "noopener,noreferrer"); };
const startCall = (lead) => { const phone = lead.primaryContact?.mobile; if (phone) window.location.href = `tel:${phone}`; };

function IInteractionPage() {
  const [searchParams] = useSearchParams();
  const requestedLeadId = searchParams.get("leadId") || "";
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";
  const { data: usersResponse } = useUsers({ page: 1, limit: 100, status: "ACTIVE" }, { enabled: isAdmin });
  const users = usersResponse?.data || [];
  const [filters, setFilters] = useState({ page: 1, limit: 25, search: "", salesStage: "", assignedTo: "", sortBy: "updatedAt", sortOrder: "desc" });
  const [activity, setActivity] = useState(null);
  const [timelineLead, setTimelineLead] = useState(null);
  const leads = useLeads(filters);
  const summary = useInteractionSummary(isAdmin && filters.assignedTo ? { assignedTo: filters.assignedTo } : {});
  const timeline = useInteractions({ leadId: timelineLead?.id || "", page: 1, limit: 50 });
  const journey = useJourney(timelineLead?.id, { enabled: Boolean(timelineLead) });
  const createInteraction = useCreateInteraction();
  const launchIntegration = useLaunchIntegration();
  const rows = leads.data?.data || [];
  const meta = leads.data?.meta || { page: 1, total: 0, totalPages: 1 };
  const stats = summary.data?.data?.summary || {};
  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: key === "page" ? value : 1 }));

  const openActivity = (lead, stage, channel) => setActivity({ lead, stage, channel });
  const columns = useMemo(() => [
    { key: "lead", header: "Lead", render: (lead) => <div className="lead-company-cell"><strong>{lead.companyName}</strong><span>{lead.permanentLeadId}</span></div> },
    { key: "contact", header: "Contact", render: (lead) => <div><strong>{lead.primaryContact?.fullName || "—"}</strong><span className="table-subtext">{lead.primaryContact?.mobile || "—"}</span><span className="table-subtext">{lead.primaryContact?.email || "—"}</span></div> },
    { key: "owner", header: "Owner", render: (lead) => lead.assignedTo?.fullName || "—" },
    { key: "stage", header: "Stage", render: (lead) => <Badge tone={tone(lead.salesStage)}>{lead.salesStage}</Badge> },
    { key: "followup", header: "Next Follow-up", render: (lead) => <div>{when(lead.nextFollowUpDate)}<span className="table-subtext">{lead.nextAction || "No next action"}</span></div> },
    { key: "actions", header: "Row Actions", render: (lead) => <div className="row-actions interaction-row-actions"><Button size="sm" variant="secondary" onClick={() => { launchIntegration.mutate({ leadId: lead.id, channel: "EMAIL" }); openActivity(lead, "C1", "EMAIL"); }}>Email</Button><Button size="sm" variant="ghost" onClick={() => { launchIntegration.mutate({ leadId: lead.id, channel: "WHATSAPP" }); openWhatsApp(lead); openActivity(lead, "C1", "WHATSAPP"); }}>WhatsApp</Button><Button size="sm" variant="secondary" onClick={() => { launchIntegration.mutate({ leadId: lead.id, channel: "CALL" }); startCall(lead); openActivity(lead, "C1", "CALL"); }}>Call</Button><Button size="sm" variant="secondary" onClick={() => openActivity(lead, "C1", "ONLINE_MEETING")}>C1</Button><Button size="sm" onClick={() => openActivity(lead, "C2", "ONLINE_MEETING")}>C2</Button><Button size="sm" variant="ghost" onClick={() => setTimelineLead(lead)}>Timeline</Button></div> },
  ], [launchIntegration]);

  const saveActivity = async (payload) => { await createInteraction.mutateAsync(payload); setActivity(null); };
  const focusLead = requestedLeadId && rows.find((item) => item.id === requestedLeadId);
  if (focusLead && !activity && searchParams.get("open") === "c1") setActivity({ lead: focusLead, stage: "C1", channel: "EMAIL" });

  return <main className="app-page interaction-page">
    <PageHeader eyebrow="I · C1 & C2" title="I — Communication & Requirement Journey" subtitle="Work directly from the permanent lead table. Every interaction stays linked to the same A lead ID and updates AIM actuals." />
    <div className="interaction-stat-grid"><StatCard label="Emails" value={stats.emails ?? 0} helper="FundsMailer-ready activity" /><StatCard label="WhatsApp" value={stats.messages ?? 0} helper="Chatting activity" /><StatCard label="Calls" value={stats.calls ?? 0} helper="Calling / recording-ready" /><StatCard label="Meetings" value={stats.meetings ?? 0} helper="Online + offline" /><StatCard label="C1 Actions" value={stats.c1 ?? 0} helper={`${stats.c1Leads ?? 0} leads currently in C1`} /><StatCard label="C2 Actions" value={stats.c2 ?? 0} helper={`${stats.c2Leads ?? 0} leads currently in C2`} /><StatCard label="Follow-ups" value={stats.pendingFollowUps ?? 0} helper="Upcoming interaction follow-ups" /><StatCard label="Response Rate" value={`${stats.responseRate ?? 0}%`} helper="Positive / total activities" /></div>
    <Card>
      <div className="section-card-head"><span className="eyebrow">DAILY EXECUTION</span><h2>Lead Interaction Table</h2><p>No duplicate lead entry and no lead dropdown. Use row actions for Email, WhatsApp, Call, C1 and C2.</p></div>
      <div className="interaction-filter-grid"><Input id="i-search" label="Search" placeholder="Company, contact, lead ID…" value={filters.search} onChange={(e) => setFilter("search", e.target.value)} /><Select id="i-stage" label="Current stage" value={filters.salesStage} onChange={(e) => setFilter("salesStage", e.target.value)}><option value="">All stages</option><option value="C1">C1</option><option value="C2">C2</option><option value="C3">C3</option></Select>{isAdmin ? <Select id="i-owner" label="Owner" value={filters.assignedTo} onChange={(e) => setFilter("assignedTo", e.target.value)}><option value="">All owners</option>{users.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}</Select> : null}<Select id="i-sort" label="Sort" value={filters.sortBy} onChange={(e) => setFilter("sortBy", e.target.value)}><option value="updatedAt">Recently updated</option><option value="nextFollowUpDate">Next follow-up</option><option value="companyName">Company</option></Select></div>
      <DataTable columns={columns} rows={rows} loading={leads.isLoading || leads.isFetching} error={leads.error} onRetry={() => leads.refetch()} emptyTitle="No leads available for I" emptyDescription="Create an A Master Lead first or change the current filters." />
      <div className="pagination-bar"><span>Page {meta.page || 1} of {meta.totalPages || 1}</span><div><Button variant="secondary" size="sm" disabled={(meta.page || 1) <= 1} onClick={() => setFilter("page", Math.max(1, filters.page - 1))}>Previous</Button><Button variant="secondary" size="sm" disabled={(meta.page || 1) >= (meta.totalPages || 1)} onClick={() => setFilter("page", filters.page + 1)}>Next</Button></div></div>
    </Card>

    <Modal open={Boolean(activity)} title={activity ? `${activity.stage} · ${activity.lead.permanentLeadId} · ${activity.lead.companyName}` : "Record Activity"} description={activity ? `${activity.channel.replaceAll("_", " ")} — same permanent lead journey` : ""} onClose={() => setActivity(null)} size="lg">
      {createInteraction.error ? <div className="inline-error">{createInteraction.error.message}</div> : null}
      {activity ? <InteractionForm lead={activity.lead} initialStage={activity.stage} initialChannel={activity.channel} saving={createInteraction.isPending} onSave={saveActivity} onCancel={() => setActivity(null)} /> : null}
    </Modal>

    <Modal open={Boolean(timelineLead)} title={timelineLead ? `${timelineLead.permanentLeadId} Interaction Timeline` : "Interaction Timeline"} description="C1/C2 communication and requirement history for this permanent lead." onClose={() => setTimelineLead(null)} size="lg">
      {journey.data?.data?.journey ? <div className="journey-summary"><Badge tone="info">{journey.data.data.journey.salesStage}</Badge><span>{journey.data.data.journey.qualificationStatus}</span><span>{journey.data.data.journey.potentialStatus}</span><span>{journey.data.data.journey.temperature}</span></div> : null}
      <div className="interaction-timeline">{(timeline.data?.data || []).map((item) => <article key={item.id} className="interaction-timeline-item"><div><Badge tone={item.stage === "C1" ? "info" : "warning"}>{item.stage}</Badge><strong>{item.channel.replaceAll("_", " ")}</strong><span>{item.response.replaceAll("_", " ")}</span></div><time>{when(item.occurredAt)}</time><p>{item.content || item.clientResponse || "Activity recorded"}</p>{item.nextAction ? <small>Next: {item.nextAction} · {when(item.nextFollowUpDate)}</small> : null}</article>)}</div>
      {!timeline.isLoading && !(timeline.data?.data || []).length ? <p className="table-subtext">No C1/C2 activities recorded for this lead yet.</p> : null}
    </Modal>
  </main>;
}
export default IInteractionPage;
