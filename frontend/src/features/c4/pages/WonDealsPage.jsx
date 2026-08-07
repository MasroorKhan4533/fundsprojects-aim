import { Link } from "react-router-dom";
import { useWonDeals } from "../hooks/useC4";

/*
  Final sales-success register.
  Later BUILD handover will connect from this list.
*/

function WonDealsPage() {
  const { data, isLoading, isError } = useWonDeals();

  if (isLoading) return <p>Loading won deals...</p>;

  if (isError) return <p>Unable to load won deals.</p>;

  const leads = data?.leads || [];

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Won Deals</h1>
          <p>Customers successfully converted through AIM</p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="aim-table">
          <thead>
            <tr>
              <th>Lead ID</th>
              <th>Company</th>
              <th>Sector</th>
              <th>Location</th>
              <th>Temperature</th>
              <th>Stage</th>
              <th>Lead Details</th>
            </tr>
          </thead>

          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.businessId}</td>
                <td>{lead.companyName}</td>
                <td>{lead.sector}</td>

                <td>
                  {[lead.city, lead.state]
                    .filter(Boolean)
                    .join(", ")}
                </td>

                <td>{lead.temperature}</td>
                <td>{lead.stage}</td>

                <td>
                  <Link
                    className="table-link"
                    to={`/leads/${lead.id}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {!leads.length && (
              <tr>
                <td colSpan="7" className="empty-cell">
                  No won deals yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default WonDealsPage;
