function Badge({ tone = "neutral", children, className = "" }) {
  return <span className={`badge badge-${tone} ${className}`.trim()}>{children}</span>;
}

export default Badge;
