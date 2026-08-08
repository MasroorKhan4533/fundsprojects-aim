import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import PasswordField from "../../../components/ui/PasswordField";
import { useResetPassword } from "../hooks/useAuth";
import { passwordSchema } from "../schemas/auth.schemas";

function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const mutation = useResetPassword();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(passwordSchema) });
  if (!token) return <section className="auth-card"><Alert tone="danger">Password reset token is missing.</Alert></section>;
  if (mutation.isSuccess) return <section className="auth-card"><Alert tone="success" title="Password changed">All previous sessions were revoked.</Alert><Link to="/login">Sign in with new password</Link></section>;
  return <section className="auth-card"><span className="eyebrow">Secure reset</span><h2>Set a new password</h2>{mutation.error ? <Alert tone="danger">{mutation.error.message}</Alert> : null}<form className="form-stack" onSubmit={handleSubmit((values) => mutation.mutate({ token, password: values.password }))}><PasswordField id="password" label="New Password" {...register("password")} error={errors.password?.message} /><PasswordField id="confirmPassword" label="Confirm Password" {...register("confirmPassword")} error={errors.confirmPassword?.message} /><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Updating..." : "Reset password"}</Button></form></section>;
}
export default ResetPasswordPage;
