import { forwardRef } from "react";

const MultiSelect = forwardRef(function MultiSelect({ label, error, hint, id, options = [], className = "", ...props }, ref) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={`field ${className}`.trim()}>
      {label ? <label htmlFor={id}>{label}</label> : null}
      <select id={id} ref={ref} multiple aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error ? <small id={`${id}-error`} className="field-error">{error}</small> : null}
      {!error && hint ? <small id={`${id}-hint`} className="field-hint">{hint}</small> : null}
    </div>
  );
});

export default MultiSelect;
