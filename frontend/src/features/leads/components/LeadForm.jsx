import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import MultiSelect from "../../../components/ui/MultiSelect";
import Select from "../../../components/ui/Select";
import TextArea from "../../../components/ui/TextArea";
import { emptyLeadForm, formToLeadPayload, leadFormSchema, leadToForm } from "../schemas/lead.schemas";

const BUSINESS_MODELS = ["B2B", "B2C", "D2C", "Manufacturer", "Distributor", "Service Provider", "E-commerce", "Project Business", "Subscription", "Marketplace"];
const STAGES = ["C1", "C2", "C3", "C4", "Won", "Lost"];
const SOURCES = ["LinkedIn", "Apollo", "Referral", "Website", "Event", "Cold Call", "Upwork", "Fiverr", "Google", "Advertisement", "Datapoint", "Other"];

function LeadForm({ lead, users = [], isAdmin = false, saving = false, onSave, onCancelEdit }) {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(leadFormSchema), defaultValues: emptyLeadForm });
  const contacts = useFieldArray({ control, name: "contacts" });
  useEffect(() => { reset(leadToForm(lead)); }, [lead, reset]);

  const submit = (values) => onSave?.(formToLeadPayload(values));
  return (
    <form onSubmit={handleSubmit(submit)} className="lead-form" noValidate>
      <div className="lead-form-section">
        <div className="lead-form-section-head"><div><h3>Company & Primary Contact</h3><p>The permanent A record. Once saved, the same lead identity will flow into I and M.</p></div>{lead ? <span className="lead-id-chip">{lead.permanentLeadId}</span> : null}</div>
        <div className="lead-form-grid">
          <Input id="companyName" label="Company Name *" error={errors.companyName?.message} {...register("companyName")} />
          <Input id="primaryContactName" label="Primary Contact *" error={errors.primaryContactName?.message} {...register("primaryContactName")} />
          <Input id="designation" label="Designation" {...register("designation")} />
          <Input id="email" label="Official Email" type="email" error={errors.email?.message} {...register("email")} />
          <Input id="mobile" label="Mobile Number" type="tel" {...register("mobile")} />
          <Input id="whatsapp" label="WhatsApp Number" type="tel" {...register("whatsapp")} />
          <Input id="linkedinProfileUrl" label="LinkedIn Profile URL" error={errors.linkedinProfileUrl?.message} {...register("linkedinProfileUrl")} />
        </div>
      </div>

      <div className="lead-form-section">
        <div className="lead-form-section-head"><div><h3>Company Intelligence</h3><p>Sector, business model, location and commercial context.</p></div></div>
        <div className="lead-form-grid">
          <Input id="industry" label="Industry / Sector *" error={errors.industry?.message} {...register("industry")} />
          <Input id="subSector" label="Sub-Sector" {...register("subSector")} />
          <MultiSelect id="businessModels" label="Business Model" hint="Use Cmd/Ctrl to select multiple" options={BUSINESS_MODELS.map((value) => ({ value, label: value }))} {...register("businessModels")} />
          <Select id="companySize" label="Company Size" {...register("companySize")}><option value="">Select</option>{["Micro", "Small", "Medium", "Large", "Enterprise"].map((value) => <option key={value}>{value}</option>)}</Select>
          <Input id="employeeStrength" label="Employee Strength" placeholder="e.g. 51–200" {...register("employeeStrength")} />
          <Input id="annualTurnover" label="Annual Turnover (₹)" type="number" min="0" {...register("annualTurnover")} />
          <Input id="estimatedBudget" label="Estimated Project Budget (₹)" type="number" min="0" {...register("estimatedBudget")} />
          <Input id="country" label="Country" {...register("country")} />
          <Input id="state" label="State" {...register("state")} />
          <Input id="city" label="City" {...register("city")} />
          <Input id="websiteUrl" label="Company Website" error={errors.websiteUrl?.message} {...register("websiteUrl")} />
          <Input id="linkedinPostUrl" label="LinkedIn Post URL" error={errors.linkedinPostUrl?.message} {...register("linkedinPostUrl")} />
          <Input id="postDate" label="Post Date" type="date" {...register("postDate")} />
        </div>
      </div>

      <div className="lead-form-section">
        <div className="lead-form-section-head"><div><h3>Qualification & Ownership</h3><p>Sales stage, buying intent, priority and the accountable owner.</p></div></div>
        <div className="lead-form-grid">
          <Select id="source" label="Lead Source" {...register("source")}>{SOURCES.map((value) => <option key={value}>{value}</option>)}</Select>
          <Select id="temperature" label="Lead Temperature" {...register("temperature")}>{["Hot", "Warm", "Potential", "Cold"].map((value) => <option key={value}>{value}</option>)}</Select>
          <Select id="leadPriority" label="Lead Priority" {...register("leadPriority")}>{["High", "Medium", "Low"].map((value) => <option key={value}>{value}</option>)}</Select>
          <Input id="buyingIntentScore" label="Buying Intent Score (0–100)" type="number" min="0" max="100" {...register("buyingIntentScore")} />
          <Select id="salesStage" label="Current Stage" {...register("salesStage")}>{STAGES.map((value) => <option key={value}>{value}</option>)}</Select>
          {isAdmin ? <Select id="assignedTo" label="Assigned Member" {...register("assignedTo")}><option value="">Current user</option>{users.map((user) => <option key={user.id} value={user.id}>{user.fullName} · {user.userId}</option>)}</Select> : null}
          <Input id="nextAction" label="Next Action" {...register("nextAction")} />
          <Input id="nextFollowUpDate" label="Next Follow-up" type="datetime-local" {...register("nextFollowUpDate")} />
          <Input id="attachmentUrl" label="Attachment URL" error={errors.attachmentUrl?.message} {...register("attachmentUrl")} />
        </div>
      </div>

      <div className="lead-form-section">
        <div className="lead-form-section-head"><div><h3>Requirement & Outreach Context</h3><p>Keep the research, requirement and personalized communication context on the permanent lead.</p></div></div>
        <div className="lead-form-grid lead-form-grid-text">
          <TextArea id="companyOverview" label="Company Overview" rows={4} {...register("companyOverview")} />
          <TextArea id="businessRequirementAnalysis" label="Business Requirement Analysis" rows={4} {...register("businessRequirementAnalysis")} />
          <TextArea id="decisionMakers" label="Decision Makers / Trusted Contacts" rows={3} {...register("decisionMakers")} />
          <TextArea id="painPointsText" label="Pain Points" hint="Comma-separated" rows={3} {...register("painPointsText")} />
          <TextArea id="postContent" label="LinkedIn Post Content" rows={3} {...register("postContent")} />
          <TextArea id="personalizedComment" label="Personalized Comment" rows={3} {...register("personalizedComment")} />
          <TextArea id="firstMessage" label="Connection / First Message" rows={3} {...register("firstMessage")} />
          <TextArea id="internalComments" label="Internal Comments" rows={3} {...register("internalComments")} />
          <TextArea id="researchNotes" label="Research Notes" rows={3} {...register("researchNotes")} />
        </div>
      </div>

      <div className="lead-form-section">
        <div className="lead-form-section-head"><div><h3>Follow-up Plan</h3><p>Three planned follow-ups are stored on A; Phase 5 will add actual C1/C2 communication activity.</p></div></div>
        <div className="followup-grid">
          {[1, 2, 3].map((n) => <div key={n} className="followup-card"><strong>Follow-up {n}</strong><Input id={`followUp${n}Date`} label="Date & Time" type="datetime-local" {...register(`followUp${n}Date`)} /><Select id={`followUp${n}Status`} label="Status" {...register(`followUp${n}Status`)}>{["Pending", "Completed", "Skipped"].map((value) => <option key={value}>{value}</option>)}</Select><TextArea id={`followUp${n}Note`} label="Note" rows={2} {...register(`followUp${n}Note`)} /></div>)}
        </div>
      </div>

      <div className="lead-form-section">
        <div className="lead-form-section-head"><div><h3>Additional Contacts</h3><p>Optional secondary contacts remain linked to this same company lead ID.</p></div><Button type="button" variant="secondary" size="sm" onClick={() => contacts.append({ fullName: "", designation: "", email: "", mobile: "", whatsapp: "", linkedinProfileUrl: "" })}>Add Contact</Button></div>
        {contacts.fields.length ? <div className="additional-contacts">{contacts.fields.map((field, index) => <div className="additional-contact" key={field.id}><div className="additional-contact-head"><strong>Contact {index + 2}</strong><Button type="button" variant="ghost" size="sm" onClick={() => contacts.remove(index)}>Remove</Button></div><div className="lead-form-grid"><Input id={`contacts.${index}.fullName`} label="Full Name" {...register(`contacts.${index}.fullName`)} /><Input id={`contacts.${index}.designation`} label="Designation" {...register(`contacts.${index}.designation`)} /><Input id={`contacts.${index}.email`} label="Email" type="email" error={errors.contacts?.[index]?.email?.message} {...register(`contacts.${index}.email`)} /><Input id={`contacts.${index}.mobile`} label="Mobile" {...register(`contacts.${index}.mobile`)} /><Input id={`contacts.${index}.whatsapp`} label="WhatsApp" {...register(`contacts.${index}.whatsapp`)} /><Input id={`contacts.${index}.linkedinProfileUrl`} label="LinkedIn" error={errors.contacts?.[index]?.linkedinProfileUrl?.message} {...register(`contacts.${index}.linkedinProfileUrl`)} /></div></div>)}</div> : <p className="lead-muted-copy">No secondary contacts added.</p>}
      </div>

      <div className="lead-form-actions">
        {lead ? <Button type="button" variant="secondary" onClick={() => { reset(emptyLeadForm); onCancelEdit?.(); }}>Cancel Edit</Button> : <Button type="button" variant="secondary" onClick={() => reset(emptyLeadForm)}>Reset</Button>}
        <Button type="submit" loading={saving} leadingIcon="save">{lead ? "Update Master Lead" : "Save Master Lead"}</Button>
      </div>
    </form>
  );
}
export default LeadForm;
