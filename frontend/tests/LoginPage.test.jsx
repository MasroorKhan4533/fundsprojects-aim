import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, test, expect } from "vitest";
import LoginPage from "../src/features/auth/pages/LoginPage";

vi.mock("../src/features/auth/hooks/useAuth", () => ({
  useCurrentUser: () => ({ isLoading: false, data: null }),
  useLogin: () => ({ mutate: vi.fn(), isPending: false, error: null }),
}));

test("login page exposes all supported identifiers", () => {
  const client = new QueryClient();
  render(<QueryClientProvider client={client}><MemoryRouter><LoginPage /></MemoryRouter></QueryClientProvider>);
  expect(screen.getByLabelText("Email / Mobile / User ID")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
});
