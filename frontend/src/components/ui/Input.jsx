import { forwardRef } from "react";

const Input = forwardRef(function Input({ label, error, hint, id, className = "", ...props }, ref) {
  return (
    <div className={`field ${className}`.trim()}>
      {label ? <label htmlFor={id}>{label}</label> : null}
      <input id={id} ref={ref} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} {...props} />
      {error ? <small id={`${id}-error`} className="field-error">{error}</small> : null}
      {!error && hint ? <small id={`${id}-hint`} className="field-hint">{hint}</small> : null}
    </div>
  );
});

export default Input;
