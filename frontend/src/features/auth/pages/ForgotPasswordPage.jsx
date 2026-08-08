import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useForgotPassword } from "../hooks/useAuth";
import { forgotPasswordSchema } from "../schemas/auth.schemas";

function ForgotPasswordPage() {
  const mutation = useForgotPassword();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(forgotPasswordSchema) });
  return <section className="auth-card"><span className="eyebrow">Account recovery</span><h2>Forgot password</h2><p className="muted">If an active account exists for this email, a secure reset link will be sent.</p>{mutation.isSuccess ? <Alert tone="success">Check your email inbox.</Alert> : null}{mutation.error ? <Alert tone="danger">{mutation.error.message}</Alert> : null}<form className="form-stack" onSubmit={handleSubmit((values) => mutation.mutate(values))}><Input id="email" label="Registered Email" type="email" {...register("email")} error={errors.email?.message} /><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Sending..." : "Send reset link"}</Button></form><div className="auth-links"><Link to="/login">Back to sign in</Link></div></section>;
}
export default ForgotPasswordPage;
