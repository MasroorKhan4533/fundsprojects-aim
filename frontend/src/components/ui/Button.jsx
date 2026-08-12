import AppIcon from "./AppIcon";

function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  children,
  loading = false,
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      className={`button button-${variant} button-${size} ${fullWidth ? "button-full" : ""} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span className="button-spinner" aria-hidden="true" /> : leadingIcon ? <AppIcon name={leadingIcon} size={17} /> : null}
      <span>{children}</span>
      {trailingIcon ? <AppIcon name={trailingIcon} size={17} /> : null}
    </button>
  );
}

export default Button;
