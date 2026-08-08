import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LeadForm from "../src/features/leads/components/LeadForm";

describe("LeadForm", () => {
  it("renders the permanent lead fields and supports adding a secondary contact", () => {
    render(<LeadForm users={[]} isAdmin onSave={vi.fn()} />);
    expect(screen.getByLabelText("Company Name *")).toBeInTheDocument();
    expect(screen.getByLabelText("Primary Contact *")).toBeInTheDocument();
    expect(screen.getByLabelText("Industry / Sector *")).toBeInTheDocument();
    expect(screen.getByLabelText("Buying Intent Score (0–100)")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add Contact" }));
    expect(screen.getByText("Contact 2")).toBeInTheDocument();
  });
});
