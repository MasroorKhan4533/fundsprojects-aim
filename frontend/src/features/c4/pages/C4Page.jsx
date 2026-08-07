import { Link } from "react-router-dom";
import { useC4Leads } from "../hooks/useC4";

/*
  C4 lead list.
*/

function C4Page() {
  const { data, isLoading, isError } = useC4Leads();

  if (isLoading) return <p>Loading C4 leads...</p>;

  if (isError) return <p>Unable to load C4 leads.</p>;

  const leads = data?.leads || [];

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>M — C4 Closure</h1>
          <p>Agreement, NDA, PO, advance and closure</p>
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
                    to={`/c4/${lead.id}`}
                  >
                    Open C4
                  </Link>
                </td>
              </tr>
            ))}

            {!leads.length && (
              <tr>
                <td colSpan="6" className="empty-cell">
                  No leads currently in C4.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default C4Page;
