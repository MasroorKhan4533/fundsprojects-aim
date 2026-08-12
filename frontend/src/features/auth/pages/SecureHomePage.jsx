import { useOutletContext } from "react-router-dom";
function SecureHomePage() {
  const { user } = useOutletContext();
  return <main className="secure-page"><section className="surface-card secure-welcome"><span className="eyebrow">Authentication checkpoint</span><h1>Welcome, {user.fullName}</h1><p>Your Production V1 account is authenticated and protected by backend RBAC.</p><div className="identity-grid"><div><span>User ID</span><strong>{user.userId}</strong></div><div><span>Role</span><strong>{user.role}</strong></div><div><span>Status</span><strong>{user.status}</strong></div><div><span>Designation</span><strong>{user.designation}</strong></div></div></section></main>;
}
export default SecureHomePage;
