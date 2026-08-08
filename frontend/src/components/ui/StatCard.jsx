import Card from "./Card";

function StatCard({ label, value, helper, trend, className = "" }) {
  return (
    <Card className={`stat-card ${className}`.trim()}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {helper ? <span className="stat-helper">{helper}</span> : null}
      {trend ? <span className={`stat-trend stat-trend-${trend.tone ?? "neutral"}`}>{trend.label}</span> : null}
    </Card>
  );
}

export default StatCard;
