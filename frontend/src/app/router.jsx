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

import C2Page from "../features/c2/pages/C2Page";
import C2LeadPage from "../features/c2/pages/C2LeadPage";

import C3Page from "../features/c3/pages/C3Page";
import C3LeadPage from "../features/c3/pages/C3LeadPage";

import C4Page from "../features/c4/pages/C4Page";
import C4LeadPage from "../features/c4/pages/C4LeadPage";
import WonDealsPage from "../features/c4/pages/WonDealsPage";
import TargetsPage from "../features/targets/pages/TargetsPage";
import PerformancePage from "../features/performance/pages/PerformancePage";
import HandoverPage from "../features/handover/pages/HandoverPage";


/*
  Central frontend router.
*/

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

      {
        path: "c2",
        element: <C2Page />,
      },

      {
        path: "c2/:leadId",
        element: <C2LeadPage />,
      },

      {
        path: "c3",
        element: <C3Page />,
      },

      {
        path: "c3/:leadId",
        element: <C3LeadPage />,
      },

      {
        path: "c4",
        element: <C4Page />,
      },

      {
        path: "c4/:leadId",
        element: <C4LeadPage />,
      },

      {
        path: "won",
        element: <WonDealsPage />,
      },

      {
        path: "targets",
        element: <TargetsPage />,
      },

      {
        path: "performance",
        element: <PerformancePage />,
      },

      {
        path: "handover",
        element: <HandoverPage />,
      },

    ],
  },
]);
