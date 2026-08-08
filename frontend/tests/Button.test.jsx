import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Button from "../src/components/ui/Button";

describe("Button", () => {
  it("renders reusable button content", () => {
    render(createElement(Button, null, "Continue"));
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
  });
});
