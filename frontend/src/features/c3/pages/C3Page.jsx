import { Link } from "react-router-dom";
import { useC3Leads } from "../hooks/useC3";

/*
  C3 lead list.
*/

function C3Page() {
  const { data, isLoading, isError } = useC3Leads();

  if (isLoading) return <p>Loading C3 leads...</p>;

  if (isError) return <p>Unable to load C3 leads.</p>;

  const leads = data?.leads || [];

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>M — C3 Solution & Commercial</h1>
          <p>Solution versions, proposal, quotation and negotiation</p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="aim-table">
          <thead>
            <tr>
              <th>Lead ID</th>
              <th>Company</th>
              <th>Sector</th>
              <th>Temperature</th>
              <th>Stage</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.businessId}</td>
                <td>{lead.companyName}</td>
                <td>{lead.sector}</td>
                <td>{lead.temperature}</td>
                <td>{lead.stage}</td>

                <td>
                  <Link
                    className="table-link"
                    to={`/c3/${lead.id}`}
                  >
                    Open C3
                  </Link>
                </td>
              </tr>
            ))}

            {!leads.length && (
              <tr>
                <td colSpan="6" className="empty-cell">
                  No leads currently in C3.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default C3Page;
