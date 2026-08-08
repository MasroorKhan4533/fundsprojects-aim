import AppIcon from "./AppIcon";

function EmptyState({ title = "Nothing here yet", description, action, icon = "inbox", compact = false }) {
  return (
    <div className={`empty-state ${compact ? "empty-state-compact" : ""}`.trim()}>
      <span className="empty-state-icon"><AppIcon name={icon} size={24} /></span>
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {action ? <div className="empty-state-action">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
