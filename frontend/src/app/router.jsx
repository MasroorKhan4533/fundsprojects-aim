import { Navigate, createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import RoleRoute from "../features/auth/components/RoleRoute";
import ActivatePage from "../features/auth/pages/ActivatePage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import UserManagementPage from "../features/users/pages/UserManagementPage";
import AimMasterPage from "../features/workspace/pages/AimMasterPage";
import TargetSheetPage from "../features/workspace/pages/TargetSheetPage";
import AMasterLeadsPage from "../features/workspace/pages/AMasterLeadsPage";
import IInteractionPage from "../features/workspace/pages/IInteractionPage";
import MClosurePage from "../features/workspace/pages/MClosurePage";
import ProfilePage from "../features/workspace/pages/ProfilePage";
import NotFoundPage from "../features/workspace/pages/NotFoundPage";
import AuthLayout from "../layouts/AuthLayout";
import SecureLayout from "../layouts/SecureLayout";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/app/aim-master" replace /> },
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
        path: "/app",
        element: <SecureLayout />,
        children: [
          { index: true, element: <Navigate to="aim-master" replace /> },
          { path: "aim-master", element: <AimMasterPage /> },
          { path: "targets", element: <TargetSheetPage /> },
          { path: "a-master-leads", element: <AMasterLeadsPage /> },
          { path: "i-c1-c2", element: <IInteractionPage /> },
          { path: "m-c3-c4", element: <MClosurePage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "admin/users", element: <RoleRoute roles={["ADMIN"]}><UserManagementPage /></RoleRoute> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
  { path: "/admin/users", element: <Navigate to="/app/admin/users" replace /> },
  { path: "*", element: <Navigate to="/app/aim-master" replace /> },
]);
