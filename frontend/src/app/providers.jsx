import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import AppErrorBoundary from "../components/common/AppErrorBoundary";
import { queryClient } from "./queryClient";
import { router } from "./router";

function AppProviders() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default AppProviders;
