import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DataTable from "../src/components/ui/DataTable";
describe("DataTable",()=>{it("renders server-provided rows using reusable columns",()=>{render(<DataTable columns={[{key:"company",header:"Company"}]} rows={[{id:"1",company:"Fundsroom"}]}/>);expect(screen.getByRole("columnheader",{name:"Company"})).toBeInTheDocument();expect(screen.getByText("Fundsroom")).toBeInTheDocument()});it("renders an empty state instead of an empty table",()=>{render(<DataTable columns={[]} rows={[]} emptyTitle="No leads yet"/>);expect(screen.getByText("No leads yet")).toBeInTheDocument()})});
