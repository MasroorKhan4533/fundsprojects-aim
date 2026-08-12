function Alert({ tone = "info", title, children }) {
  return (
    <div className={`alert alert-${tone}`} role={tone === "danger" ? "alert" : "status"}>
      {title ? <strong>{title}</strong> : null}
      {children ? <div>{children}</div> : null}
    </div>
  );
}

export default Alert;
