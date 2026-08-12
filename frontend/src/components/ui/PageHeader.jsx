function PageHeader({ eyebrow, title, subtitle, actions, children, className = "" }) {
  return (
    <div className={`page-header ${className}`.trim()}>
      <div className="page-header-copy">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
        {children}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </div>
  );
}

export default PageHeader;
