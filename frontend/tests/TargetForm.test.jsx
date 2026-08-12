import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TargetForm from "../src/features/targets/components/TargetForm";
const admin={id:"1",role:"ADMIN"}; const users=[{id:"2",fullName:"Pooja Sherge",userId:"FPA-000002"}];
describe("TargetForm",()=>{it("renders the production target fields",()=>{render(<TargetForm users={users} currentUser={admin} onSubmit={()=>{}} onCancel={()=>{}} busy={false}/>);expect(screen.getByLabelText("Target Date")).toBeInTheDocument();expect(screen.getByLabelText("Assigned To")).toBeInTheDocument();expect(screen.getByLabelText("Revenue Target (₹)")).toBeInTheDocument();expect(screen.getByRole("button",{name:"Save Target"})).toBeInTheDocument()})});
