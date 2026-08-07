import { createBrowserRouter } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import ProtectedRoute from "../features/auth/components/ProtectedRoute";

import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";

import LeadsPage from "../features/leads/pages/LeadsPage";
import LeadDetailsPage from "../features/leads/pages/LeadDetailsPage";

import C1Page from "../features/c1/pages/C1Page";
import C1LeadPage from "../features/c1/pages/C1LeadPage";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),

    children: [
      {
        index: true,
        element: <DashboardPage />,
      },

      {
        path: "leads",
        element: <LeadsPage />,
      },

      {
        path: "leads/:id",
        element: <LeadDetailsPage />,
      },

      {
        path: "c1",
        element: <C1Page />,
      },

      {
        path: "c1/:leadId",
        element: <C1LeadPage />,
      },
    ],
  },
]);
