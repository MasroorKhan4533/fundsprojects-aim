import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import ActivatePage from "../features/auth/pages/ActivatePage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import SecureHomePage from "../features/auth/pages/SecureHomePage";
import UserManagementPage from "../features/users/pages/UserManagementPage";
import AuthLayout from "../layouts/AuthLayout";
import SecureLayout from "../layouts/SecureLayout";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/activate", element: <ActivatePage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <SecureLayout />,
        children: [{ path: "/", element: <SecureHomePage /> }, { path: "/app", element: <SecureHomePage /> }],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={["ADMIN"]} />,
    children: [
      {
        element: <SecureLayout />,
        children: [{ path: "/admin/users", element: <UserManagementPage /> }],
      },
    ],
  },
]);
