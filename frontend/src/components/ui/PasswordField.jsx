import { forwardRef, useState } from "react";

const PasswordField = forwardRef(function PasswordField({ label = "Password", error, hint, id, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="password-wrap">
        <input id={id} ref={ref} type={visible ? "text" : "password"} aria-invalid={Boolean(error)} {...props} />
        <button type="button" className="password-toggle" onClick={() => setVisible((value) => !value)}>{visible ? "Hide" : "Show"}</button>
      </div>
      {error ? <small className="field-error">{error}</small> : hint ? <small className="field-hint">{hint}</small> : null}
    </div>
  );
});
export default PasswordField;
