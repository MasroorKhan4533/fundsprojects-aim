import { Link } from "react-router-dom";
import { useC1Leads } from "../hooks/useC1";

function C1Page() {
  const { data, isLoading, isError } = useC1Leads();

  if (isLoading) {
    return <p>Loading C1 leads...</p>;
  }

  if (isError) {
    return <p>Unable to load C1 leads.</p>;
  }

  const leads = data?.leads || [];

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>I — C1 Connect</h1>
          <p>Communication, meetings and follow-ups</p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="aim-table">
          <thead>
            <tr>
              <th>Lead ID</th>
              <th>Company</th>
              <th>Contact</th>
              <th>Owner</th>
              <th>Temperature</th>
              <th>Last Activity</th>
              <th>Next Follow-up</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {leads.map((lead) => {
              const contact = lead.contacts?.[0];

              return (
                <tr key={lead.id}>
                  <td>{lead.businessId}</td>
                  <td>{lead.companyName}</td>
                  <td>
                    {contact?.fullName || "-"}
                    <small>{contact?.mobile || ""}</small>
                  </td>
                  <td>{lead.assignedOwner?.fullName || "-"}</td>
                  <td>{lead.temperature}</td>
                  <td>
                    {lead.lastActivity
                      ? new Date(lead.lastActivity.activityAt).toLocaleString()
                      : "-"}
                  </td>
                  <td>
                    {lead.nextFollowUp
                      ? new Date(lead.nextFollowUp.followUpAt).toLocaleString()
                      : "-"}
                  </td>
                  <td>
                    <Link
                      className="table-link"
                      to={`/c1/${lead.id}`}
                    >
                      Open C1
                    </Link>
                  </td>
                </tr>
              );
            })}

            {!leads.length && (
              <tr>
                <td colSpan="8" className="empty-cell">
                  No C1 leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default C1Page;
