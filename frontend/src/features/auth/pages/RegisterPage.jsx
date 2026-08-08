import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useRegister } from "../hooks/useAuth";
import { registrationSchema } from "../schemas/auth.schemas";

function RegisterPage() {
  const mutation = useRegister();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(registrationSchema) });
  if (mutation.isSuccess) return <section className="auth-card"><Alert tone="success" title="Registration submitted">Your account request is waiting for administrator approval. After approval, an activation link will be sent to your registered email.</Alert><Link to="/login">Return to sign in</Link></section>;
  return <section className="auth-card"><span className="eyebrow">Internal registration</span><h2>Request access</h2><p className="muted">Registration does not grant access automatically. An administrator must approve your account.</p>{mutation.error ? <Alert tone="danger">{mutation.error.message}</Alert> : null}<form className="form-stack" onSubmit={handleSubmit((values) => mutation.mutate(values))}><Input id="fullName" label="Full Name" {...register("fullName")} error={errors.fullName?.message} /><Input id="mobile" label="Mobile Number" placeholder="+919876543210" {...register("mobile")} error={errors.mobile?.message} hint="Include country code." /><Input id="email" label="Email Address" type="email" {...register("email")} error={errors.email?.message} /><Input id="designation" label="Company Role / Designation" {...register("designation")} error={errors.designation?.message} /><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Submitting..." : "Submit registration"}</Button></form><div className="auth-links"><Link to="/login">Already registered? Sign in</Link></div></section>;
}
export default RegisterPage;
