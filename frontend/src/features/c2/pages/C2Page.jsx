import { Link } from "react-router-dom";
import { useC2Leads } from "../hooks/useC2";

/*
  C2 lead list.
*/

function C2Page() {
  const { data, isLoading, isError } = useC2Leads();

  if (isLoading) return <p>Loading C2 leads...</p>;

  if (isError) return <p>Unable to load C2 leads.</p>;

  const leads = data?.leads || [];

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>I — C2 Clarity</h1>
          <p>Detailed workflow and requirement definition</p>
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
                    to={`/c2/${lead.id}`}
                  >
                    Open C2
                  </Link>
                </td>
              </tr>
            ))}

            {!leads.length && (
              <tr>
                <td colSpan="6" className="empty-cell">
                  No leads currently in C2.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default C2Page;
