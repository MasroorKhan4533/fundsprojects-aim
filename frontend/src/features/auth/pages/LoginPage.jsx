import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import PasswordField from "../../../components/ui/PasswordField";
import Spinner from "../../../components/ui/Spinner";
import { useCurrentUser, useLogin } from "../hooks/useAuth";
import { loginSchema } from "../schemas/auth.schemas";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useCurrentUser();
  const login = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { identifier: "", password: "", rememberMe: false } });

  if (currentUser.isLoading) return <div className="auth-card"><Spinner label="Checking session" /></div>;
  if (currentUser.data) return <Navigate to="/app" replace />;

  const submit = handleSubmit((values) => login.mutate(values, { onSuccess: () => navigate(location.state?.from || "/app", { replace: true }) }));
  return <section className="auth-card"><span className="eyebrow">Secure sign in</span><h2>Welcome back</h2><p className="muted">Use your email, mobile number or FundsProjects user ID.</p>{login.error ? <Alert tone="danger" title="Sign in failed">{login.error.message}</Alert> : null}<form onSubmit={submit} className="form-stack"><Input id="identifier" label="Email / Mobile / User ID" autoComplete="username" {...register("identifier")} error={errors.identifier?.message} /><PasswordField id="password" label="Password" autoComplete="current-password" {...register("password")} error={errors.password?.message} /><label className="check-row"><input type="checkbox" {...register("rememberMe")} /> Keep me signed in on this device</label><Button type="submit" disabled={login.isPending}>{login.isPending ? "Signing in..." : "Sign in"}</Button></form><div className="auth-links"><Link to="/forgot-password">Forgot password?</Link><Link to="/register">New internal user? Register</Link></div></section>;
}
export default LoginPage;
