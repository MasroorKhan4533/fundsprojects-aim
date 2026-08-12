import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../components/ui/Button";
import DateTimePicker from "../../../components/ui/DateTimePicker";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import TextArea from "../../../components/ui/TextArea";
import { interactionFormSchema } from "../schemas/interaction.schemas";

const localNow = () => { const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000); return d.toISOString().slice(0, 16); };
const defaults = (stage = "C1", channel = "EMAIL") => ({ stage, channel, response: "NO_RESPONSE", outcome: "STAY", occurredAt: localNow(), content: "", clientResponse: "", agenda: "", recordingUrl: "", meetingMode: "", nextAction: "", nextFollowUpDate: "", understanding: "", requirement: "", workflow: "", mustHave: "", goodToHave: "", exclusions: "", reports: "", integrations: "", feedback: "", potentialStatus: "UNCLASSIFIED", qualificationStatus: "UNQUALIFIED", temperature: "Warm", painPoints: "", businessRequirement: "", decisionContext: "", internalNotes: "", attachmentUrl: "" });

function InteractionForm({ lead, initialStage = "C1", initialChannel = "EMAIL", saving, onSave, onCancel }) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({ resolver: zodResolver(interactionFormSchema), defaultValues: defaults(initialStage, initialChannel) });
  useEffect(() => { reset(defaults(initialStage, initialChannel)); }, [initialStage, initialChannel, lead?.id, reset]);
  const stage = watch("stage");
  const submit = (values) => onSave({
    leadId: lead.id, stage: values.stage, channel: values.channel, response: values.response, outcome: values.outcome,
    occurredAt: new Date(values.occurredAt).toISOString(), content: values.content || "", clientResponse: values.clientResponse || "", agenda: values.agenda || "", recordingUrl: values.recordingUrl || "", meetingMode: values.meetingMode || "", nextAction: values.nextAction || "", nextFollowUpDate: values.nextFollowUpDate ? new Date(values.nextFollowUpDate).toISOString() : "", attachmentUrl: values.attachmentUrl || "",
    c1: { understanding: values.understanding || "", requirement: values.requirement || "" }, c2: { workflow: values.workflow || "", mustHave: values.mustHave || "", goodToHave: values.goodToHave || "", exclusions: values.exclusions || "", reports: values.reports || "", integrations: values.integrations || "", feedback: values.feedback || "" },
    potentialStatus: values.potentialStatus, qualificationStatus: values.qualificationStatus, temperature: values.temperature,
    painPoints: (values.painPoints || "").split(/\n|,/).map((item) => item.trim()).filter(Boolean), businessRequirement: values.businessRequirement || "", decisionContext: values.decisionContext || "", internalNotes: values.internalNotes || "",
  });
  return <form className="interaction-form" onSubmit={handleSubmit(submit)}>
    <div className="interaction-form-grid">
      <Select id="interaction-stage" label="Stage" {...register("stage")} error={errors.stage?.message}><option value="C1">C1 — Connect</option><option value="C2">C2 — Clarity</option></Select>
      <Select id="interaction-channel" label="Channel" {...register("channel")} error={errors.channel?.message}><option value="EMAIL">Email / FundsMailer</option><option value="WHATSAPP">WhatsApp / Chatting</option><option value="CALL">Call</option><option value="ONLINE_MEETING">Online Meeting</option><option value="OFFLINE_MEETING">Offline Meeting</option><option value="OTHER">Other</option></Select>
      <DateTimePicker id="interaction-date" label="Activity date & time" {...register("occurredAt")} error={errors.occurredAt?.message} />
      <Select id="interaction-response" label="Client response" {...register("response")}><option value="POSITIVE">Positive</option><option value="NEUTRAL">Neutral</option><option value="NEGATIVE">Negative</option><option value="NO_RESPONSE">No response</option><option value="FOLLOW_UP_REQUIRED">Follow-up required</option></Select>
      <Select id="interaction-outcome" label="Stage outcome" {...register("outcome")}><option value="STAY">Stay in current stage</option>{stage === "C1" ? <option value="MOVE_TO_C2">Move to C2</option> : <option value="MOVE_TO_C3">Move to C3</option>}<option value="LOST">Lost</option></Select>
      <Input id="meeting-mode" label="Meeting mode / location" placeholder="Google Meet / Office / Client site" {...register("meetingMode")} />
      <TextArea id="interaction-content" className="full-span" label="Communication / discussion content" placeholder="What was sent or discussed?" {...register("content")} />
      <TextArea id="client-response" className="full-span" label="Client response" placeholder="What did the client say?" {...register("clientResponse")} />
      <TextArea id="agenda" className="full-span" label="Agenda / context" {...register("agenda")} />
      <Input id="recording-url" label="Call / meeting recording URL" placeholder="Future calling integration ready" {...register("recordingUrl")} error={errors.recordingUrl?.message} />
      <Input id="attachment-url" label="Attachment / document URL" {...register("attachmentUrl")} error={errors.attachmentUrl?.message} />
      {stage === "C1" ? <><TextArea id="c1-understanding" className="full-span" label="Initial business understanding" {...register("understanding")} /><TextArea id="c1-requirement" className="full-span" label="Initial requirement" {...register("requirement")} /></> : <>
        <TextArea id="c2-workflow" className="full-span" label="Current workflow" {...register("workflow")} /><TextArea id="c2-must" label="Must-have requirements" {...register("mustHave")} /><TextArea id="c2-good" label="Good-to-have requirements" {...register("goodToHave")} /><TextArea id="c2-exclusions" label="Explicit exclusions" {...register("exclusions")} /><TextArea id="c2-reports" label="Reports / analytics required" {...register("reports")} /><TextArea id="c2-integrations" label="Integrations" {...register("integrations")} /><TextArea id="c2-feedback" label="Feedback / validation" {...register("feedback")} />
        <Select id="potential-status" label="Potential status" {...register("potentialStatus")}><option value="UNCLASSIFIED">Unclassified</option><option value="POTENTIAL">Potential</option><option value="NON_POTENTIAL">Non-Potential</option></Select>
        <Select id="qualification-status" label="Qualification" {...register("qualificationStatus")}><option value="UNQUALIFIED">Unqualified</option><option value="QUALIFYING">Qualifying</option><option value="QUALIFIED">Qualified</option><option value="DISQUALIFIED">Disqualified</option></Select>
        <Select id="temperature" label="Lead temperature" {...register("temperature")}><option value="Hot">Hot</option><option value="Warm">Warm</option><option value="Potential">Potential</option><option value="Cold">Cold</option></Select>
        <TextArea id="pain-points" className="full-span" label="Pain points" hint="Comma or new-line separated" {...register("painPoints")} /><TextArea id="business-requirement" className="full-span" label="Business requirement" {...register("businessRequirement")} /><TextArea id="decision-context" label="Decision / buying context" {...register("decisionContext")} /><TextArea id="internal-notes" label="Internal notes" {...register("internalNotes")} />
      </>}
      <Input id="next-action" label="Next action" {...register("nextAction")} />
      <DateTimePicker id="next-followup" label="Next follow-up" {...register("nextFollowUpDate")} />
    </div>
    <div className="interaction-form-actions"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit" loading={saving}>Save {stage} Activity</Button></div>
  </form>;
}
export default InteractionForm;
