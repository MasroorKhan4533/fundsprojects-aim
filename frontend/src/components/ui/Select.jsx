import { forwardRef } from "react";
const Select = forwardRef(function Select({ label, id, error, children, ...props }, ref) {
  return <div className="field"><label htmlFor={id}>{label}</label><select id={id} ref={ref} aria-invalid={Boolean(error)} {...props}>{children}</select>{error ? <small className="field-error">{error}</small> : null}</div>;
});
export default Select;
