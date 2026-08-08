import { createBrowserRouter } from "react-router-dom";
import SystemStatusPage from "../features/system/pages/SystemStatusPage";
import FoundationLayout from "../layouts/FoundationLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <FoundationLayout />,
    children: [
      { index: true, element: <SystemStatusPage /> },
    ],
  },
]);
