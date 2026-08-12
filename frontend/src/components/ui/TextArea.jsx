import { forwardRef } from "react";

const TextArea = forwardRef(function TextArea({ label, error, hint, id, className = "", ...props }, ref) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={`field ${className}`.trim()}>
      {label ? <label htmlFor={id}>{label}</label> : null}
      <textarea id={id} ref={ref} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props} />
      {error ? <small id={`${id}-error`} className="field-error">{error}</small> : null}
      {!error && hint ? <small id={`${id}-hint`} className="field-hint">{hint}</small> : null}
    </div>
  );
});

export default TextArea;
