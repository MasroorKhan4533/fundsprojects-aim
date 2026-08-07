import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLogin } from "../hooks/useLogin";

function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const authQuery = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  if (authQuery.data?.user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (values) => {
    try {
      await loginMutation.mutateAsync(values);
      navigate("/");
    } catch {
      // API error is displayed below.
    }
  };

  return (
    <div className="login-card">
      <div className="login-brand">
        <div className="brand-mark">AIM</div>
        <div>
          <h1>FundsProjects AIM</h1>
          <p>Sales & Marketing Operations</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <label>
          Email
          <input
            type="email"
            placeholder="Enter your email"
            {...register("email", {
              required: "Email is required",
            })}
          />
        </label>

        {errors.email && (
          <span className="field-error">{errors.email.message}</span>
        )}

        <label>
          Password
          <input
            type="password"
            placeholder="Enter your password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Minimum 8 characters required",
              },
            })}
          />
        </label>

        {errors.password && (
          <span className="field-error">{errors.password.message}</span>
        )}

        {loginMutation.isError && (
          <div className="login-error">
            {loginMutation.error.message}
          </div>
        )}

        <button
          type="submit"
          className="primary-button"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
