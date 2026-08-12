import { forwardRef } from "react";

const DateTimePicker = forwardRef(function DateTimePicker({ id, label, error, hint, ...props }, ref) {
  return (
    <div className="field">
      {label ? <label htmlFor={id}>{label}</label> : null}
      <input id={id} ref={ref} type="datetime-local" aria-invalid={Boolean(error)} {...props} />
      {error ? <small className="field-error">{error}</small> : hint ? <small className="field-hint">{hint}</small> : null}
    </div>
  );
});

export default DateTimePicker;
