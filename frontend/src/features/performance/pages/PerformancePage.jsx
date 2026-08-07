import { usePerformance } from "../hooks/usePerformance";

function PerformancePage() {
  const query =
    usePerformance();

  if (
    query.isLoading
  ) {
    return (
      <p>
        Loading performance...
      </p>
    );
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>
            Team Performance
          </h1>

          <p>
            Sales activity and
            conversion overview
          </p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="aim-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Leads</th>
              <th>Activities</th>
              <th>Calls</th>
              <th>Meetings</th>
              <th>Follow-ups</th>
              <th>Won</th>
              <th>Conversion</th>
            </tr>
          </thead>

          <tbody>
            {(query.data
              ?.performance ||
              []).map(
              (row) => (
                <tr
                  key={
                    row.user.id
                  }
                >
                  <td>
                    {
                      row.user
                        .fullName
                    }
                  </td>

                  <td>
                    {row.leads}
                  </td>

                  <td>
                    {
                      row.activities
                    }
                  </td>

                  <td>
                    {row.calls}
                  </td>

                  <td>
                    {
                      row.meetings
                    }
                  </td>

                  <td>
                    {
                      row.completedFollowUps
                    }
                  </td>

                  <td>
                    {row.won}
                  </td>

                  <td>
                    {
                      row.conversionRate
                    }
                    %
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default PerformancePage;
