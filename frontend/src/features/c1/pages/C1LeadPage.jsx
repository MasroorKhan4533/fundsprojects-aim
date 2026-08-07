import { Link, useParams } from "react-router-dom";
import { useC1Summary, useTimeline } from "../hooks/useC1";

function C1LeadPage() {
  const { leadId } = useParams();

  const summary = useC1Summary(leadId);
  const timeline = useTimeline(leadId);

  if (summary.isLoading) {
    return <p>Loading C1 workspace...</p>;
  }

  if (summary.isError || !summary.data?.lead) {
    return <p>Unable to load C1 workspace.</p>;
  }

  const { lead, profile, activities, followUps } = summary.data;

  return (
    <section>
      <div className="page-header">
        <div>
          <Link className="table-link" to="/c1">
            ← C1 Leads
          </Link>

          <h1>{lead.companyName}</h1>
          <p>{lead.businessId} · C1 Connect</p>
        </div>
      </div>

      <div className="panel">
        <h2>C1 Business Understanding</h2>

        <p>
          <strong>Business Understanding:</strong>{" "}
          {profile?.businessUnderstanding || "-"}
        </p>

        <p>
          <strong>Initial Requirement:</strong>{" "}
          {profile?.initialRequirement || "-"}
        </p>

        <p>
          <strong>Current Pain Points:</strong>{" "}
          {profile?.currentPainPoints || "-"}
        </p>

        <p>
          <strong>Buying Intent:</strong>{" "}
          {profile?.buyingIntent || "UNKNOWN"}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {profile?.status || "NOT_STARTED"}
        </p>
      </div>

      <div className="panel">
        <h2>Communication / Meeting</h2>

        {(activities || []).map((activity) => (
          <div className="record-row" key={activity.id}>
            <div>
              <strong>
                {activity.activityType} · {activity.customerResponse || "-"}
              </strong>

              <span>{activity.discussionContent || "-"}</span>

              <span>
                {new Date(activity.activityAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}

        {!activities?.length && <p>No activities recorded.</p>}
      </div>

      <div className="panel">
        <h2>Follow-ups</h2>

        {(followUps || []).map((followUp) => (
          <div className="record-row" key={followUp.id}>
            <div>
              <strong>{followUp.followUpType}</strong>

              <span>
                {new Date(followUp.followUpAt).toLocaleString()}
              </span>

              <span>
                {followUp.displayStatus || followUp.status}
              </span>
            </div>
          </div>
        ))}

        {!followUps?.length && <p>No follow-ups recorded.</p>}
      </div>

      <div className="panel">
        <h2>Lead Timeline</h2>

        {(timeline.data?.timeline || []).map((item) => (
          <div className="timeline-item" key={`${item.type}-${item.id}`}>
            <strong>{item.type}</strong>
            <p>{item.title}</p>
            <small>{new Date(item.date).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

export default C1LeadPage;
