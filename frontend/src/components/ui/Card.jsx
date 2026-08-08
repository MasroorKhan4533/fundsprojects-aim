function Card({ className = "", children, as: Component = "section", padding = "md", ...props }) {
  return <Component className={`surface-card card-padding-${padding} ${className}`.trim()} {...props}>{children}</Component>;
}

export default Card;
