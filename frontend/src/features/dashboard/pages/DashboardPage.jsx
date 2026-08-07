import { useDashboard } from "../hooks/useDashboard";

function Card({
  title,
  value,
}) {
  return (
    <div className="metric-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DashboardPage() {
  const {
    data,
    isLoading,
  } =
    useDashboard();

  if (isLoading) {
    return <p>Loading dashboard...</p>;
  }

  const d =
    data?.dashboard || {};

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>
            AIM Master Dashboard
          </h1>

          <p>
            Live sales and marketing
            operations overview
          </p>
        </div>
      </div>

      <div className="metric-grid">
        <Card
          title="Total Leads"
          value={d.totalLeads || 0}
        />

        <Card
          title="Hot Leads"
          value={d.hotLeads || 0}
        />

        <Card
          title="Calls Today"
          value={d.callsToday || 0}
        />

        <Card
          title="Meetings Today"
          value={d.meetingsToday || 0}
        />

        <Card
          title="Pending Follow-ups"
          value={d.pendingFollowUps || 0}
        />

        <Card
          title="Overdue Follow-ups"
          value={d.overdueFollowUps || 0}
        />

        <Card
          title="Pipeline Value"
          value={`₹${Number(
            d.pipelineValue || 0
          ).toLocaleString()}`}
        />

        <Card
          title="Won Value"
          value={`₹${Number(
            d.wonValue || 0
          ).toLocaleString()}`}
        />

        <Card
          title="Conversion"
          value={`${d.conversionRate || 0}%`}
        />
      </div>

      <div className="panel">
        <h2>Sales Journey</h2>

        <div className="stage-grid">
          {[
            ["C1", d.stages?.c1],
            ["C2", d.stages?.c2],
            ["C3", d.stages?.c3],
            ["C4", d.stages?.c4],
            ["WON", d.stages?.won],
            ["LOST", d.stages?.lost],
          ].map(
            ([stage, count]) => (
              <div
                className="stage-card"
                key={stage}
              >
                <strong>
                  {count || 0}
                </strong>

                <span>
                  {stage}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
