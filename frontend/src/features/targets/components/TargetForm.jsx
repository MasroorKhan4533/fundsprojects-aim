import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import TextArea from "../../../components/ui/TextArea";

const metric = z.coerce.number().min(0, "Cannot be negative");
const schema = z.object({ targetDate: z.string().min(1, "Target date is required"), assignedTo: z.string().min(1, "Assigned user is required"), focusStage: z.enum(["Overall","C1","C2","C3","C4"]), leads: metric, emails: metric, messages: metric, calls: metric, meetings: metric, c1: metric, c2: metric, c3: metric, c4: metric, proposals: metric, revenue: metric, notes: z.string().max(1500) });
const defaults = { targetDate: new Date().toISOString().slice(0,10), assignedTo: "", focusStage: "Overall", leads: 20, emails: 100, messages: 100, calls: 50, meetings: 5, c1: 20, c2: 5, c3: 2, c4: 1, proposals: 2, revenue: 500000, notes: "" };
const fromTarget = (target) => target ? { targetDate: target.targetDate, assignedTo: target.assignedTo.id, focusStage: target.focusStage, ...target.metrics, notes: target.notes || "" } : defaults;

function TargetForm({ users, editing, currentUser, onSubmit, onCancel, busy }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: fromTarget(editing) });
  useEffect(() => { reset({ ...fromTarget(editing), assignedTo: editing?.assignedTo?.id || (currentUser.role === "ADMIN" ? "" : currentUser.id) }); }, [editing, currentUser, reset]);
  const submit = (values) => onSubmit({ targetDate: values.targetDate, assignedTo: values.assignedTo, focusStage: values.focusStage, metrics: { leads: values.leads, emails: values.emails, messages: values.messages, calls: values.calls, meetings: values.meetings, c1: values.c1, c2: values.c2, c3: values.c3, c4: values.c4, proposals: values.proposals, revenue: values.revenue }, notes: values.notes });
  return <form className="target-form" onSubmit={handleSubmit(submit)}>
    <div className="target-form-grid">
      <Input id="targetDate" type="date" label="Target Date" error={errors.targetDate?.message} {...register("targetDate")} />
      <Select id="assignedTo" label="Assigned To" error={errors.assignedTo?.message} {...register("assignedTo")}><option value="">Select team member</option>{users.map((user)=><option key={user.id} value={user.id}>{user.fullName} ({user.userId})</option>)}</Select>
      <Select id="focusStage" label="Focus Stage" {...register("focusStage")}><option>Overall</option><option>C1</option><option>C2</option><option>C3</option><option>C4</option></Select>
      {[["leads","Lead Target"],["emails","Email Target"],["messages","WhatsApp Target"],["calls","Call Target"],["meetings","Meeting Target"],["c1","C1 Target"],["c2","C2 Target"],["c3","C3 Target"],["c4","C4 Target"],["proposals","Proposal Target"],["revenue","Revenue Target (₹)"]].map(([name,label])=><Input key={name} id={name} type="number" min="0" label={label} error={errors[name]?.message} {...register(name)} />)}
      <TextArea id="notes" label="Notes" className="target-notes" error={errors.notes?.message} {...register("notes")} />
    </div>
    <div className="target-form-actions"><Button type="button" variant="secondary" onClick={onCancel}>Clear</Button><Button type="submit" loading={busy}>{editing ? "Update Target" : "Save Target"}</Button></div>
  </form>;
}
export default TargetForm;
