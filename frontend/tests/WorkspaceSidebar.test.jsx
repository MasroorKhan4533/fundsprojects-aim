import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import WorkspaceSidebar from "../src/components/common/WorkspaceSidebar";
const admin={role:"ADMIN"};const member={role:"TEAM_MEMBER"};
function renderSidebar(user){return render(<MemoryRouter initialEntries={["/app/aim-master"]}><WorkspaceSidebar user={user}/></MemoryRouter>)}
describe("WorkspaceSidebar",()=>{it("renders the complete simplified AIM workspace",()=>{renderSidebar(admin);["AIM Master","Target Sheet","A — Master Leads","I — C1 & C2","M — C3 & C4","My Profile","User Management"].forEach((label)=>expect(screen.getByRole("link",{name:label})).toBeInTheDocument())});it("does not expose administration navigation to team members",()=>{renderSidebar(member);expect(screen.queryByRole("link",{name:"User Management"})).not.toBeInTheDocument()})});
