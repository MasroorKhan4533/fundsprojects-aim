import { Link, Outlet } from "react-router-dom";
function AuthLayout() {
  return <main className="auth-shell"><section className="auth-brand-panel"><span className="eyebrow">FundsProjects AIM</span><h1>Internal sales operating system.</h1><p>Secure access to leads, targets, C1–C4 execution and closure workflows.</p><div className="auth-brand-mark">FR</div></section><section className="auth-form-panel"><div className="auth-top"><Link to="/login" className="brand-link">FundsProjects AIM</Link><span className="environment-pill">Production V1 · Local</span></div><Outlet /></section></main>;
}
export default AuthLayout;
