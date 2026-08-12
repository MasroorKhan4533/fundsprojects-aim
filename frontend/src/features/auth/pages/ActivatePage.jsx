import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import PasswordField from "../../../components/ui/PasswordField";
import { useActivate } from "../hooks/useAuth";
import { passwordSchema } from "../schemas/auth.schemas";

function ActivatePage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const mutation = useActivate();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(passwordSchema) });
  if (!token) return <section className="auth-card"><Alert tone="danger">Activation token is missing.</Alert></section>;
  if (mutation.isSuccess) return <section className="auth-card"><Alert tone="success" title="Account activated">Your password has been set successfully.</Alert><Link to="/login">Sign in</Link></section>;
  return <section className="auth-card"><span className="eyebrow">Account activation</span><h2>Create your password</h2>{mutation.error ? <Alert tone="danger">{mutation.error.message}</Alert> : null}<form className="form-stack" onSubmit={handleSubmit((values) => mutation.mutate({ token, password: values.password }))}><PasswordField id="password" label="New Password" {...register("password")} error={errors.password?.message} hint="12+ characters with upper, lower, number and special character." /><PasswordField id="confirmPassword" label="Confirm Password" {...register("confirmPassword")} error={errors.confirmPassword?.message} /><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Activating..." : "Activate account"}</Button></form></section>;
}
export default ActivatePage;
