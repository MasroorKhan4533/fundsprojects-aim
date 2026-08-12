import { useMemo, useState } from "react";
import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Spinner from "../../../components/ui/Spinner";
import { useChangeRole, useChangeStatus, useResendActivation, useReviewUser, useSendPasswordReset, useUsers } from "../hooks/useUsers";

function UserManagementPage() {
  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");
  const params = useMemo(() => ({ page: "1", limit: "50", ...(status ? { status } : {}), ...(search ? { search } : {}) }), [status, search]);
  const users = useUsers(params);
  const review = useReviewUser();
  const resend = useResendActivation();
  const reset = useSendPasswordReset();
  const role = useChangeRole();
  const account = useChangeStatus();
  const activeError = review.error || resend.error || reset.error || role.error || account.error;

  const approve = (user) => review.mutate({ id: user.id, body: { decision: "APPROVE", role: "TEAM_MEMBER" } });
  const reject = (user) => {
    const reason = window.prompt(`Reason for rejecting ${user.fullName}:`);
    if (reason?.trim()) review.mutate({ id: user.id, body: { decision: "REJECT", reason: reason.trim() } });
  };

  return <main className="secure-page"><div className="page-heading"><div><span className="eyebrow">Administration</span><h1>User Management</h1><p>Review registration requests, manage roles and secure account access.</p></div><div className="admin-filters"><Select id="status-filter" label="Status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All</option><option>PENDING</option><option>APPROVED</option><option>ACTIVE</option><option>DISABLED</option><option>REJECTED</option></Select><label className="field"><span>Search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, mobile, ID" /></label></div></div>{activeError ? <Alert tone="danger">{activeError.message}</Alert> : null}{users.isLoading ? <Spinner label="Loading users" /> : users.isError ? <Alert tone="danger">{users.error.message}</Alert> : <section className="surface-card table-card"><div className="table-scroll"><table className="admin-table"><thead><tr><th>User</th><th>Contact</th><th>Designation</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>{users.data?.data?.map((user) => <tr key={user.id}><td><strong>{user.fullName}</strong><small>{user.userId}</small></td><td>{user.email}<small>{user.mobile}</small></td><td>{user.designation}</td><td><select value={user.role} onChange={(event) => role.mutate({ id: user.id, role: event.target.value })} disabled={user.status === "PENDING"}><option>TEAM_MEMBER</option><option>ADMIN</option></select></td><td><span className={`status-badge status-${user.status.toLowerCase()}`}>{user.status}</span></td><td><div className="row-actions">{user.status === "PENDING" || user.status === "REJECTED" ? <><Button onClick={() => approve(user)}>Approve</Button><Button variant="secondary" onClick={() => reject(user)}>Reject</Button></> : null}{user.status === "APPROVED" ? <Button variant="secondary" onClick={() => resend.mutate(user.id)}>Resend activation</Button> : null}{user.status === "ACTIVE" ? <><Button variant="secondary" onClick={() => reset.mutate(user.id)}>Reset email</Button><Button variant="secondary" onClick={() => account.mutate({ id: user.id, status: "DISABLED" })}>Disable</Button></> : null}{user.status === "DISABLED" ? <Button onClick={() => account.mutate({ id: user.id, status: "ACTIVE" })}>Enable</Button> : null}</div></td></tr>)}</tbody></table></div></section>}</main>;
}
export default UserManagementPage;
