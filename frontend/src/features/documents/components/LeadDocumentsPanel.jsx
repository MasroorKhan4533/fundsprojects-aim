import { useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import { documentsApi } from "../api/documents.api";
import { useDeleteDocument, useLeadDocuments, useUploadDocument } from "../hooks/useDocuments";
const categories = ["GENERAL", "REQUIREMENT", "PROPOSAL", "QUOTATION", "AGREEMENT", "NDA", "PO", "RECORDING", "OTHER"];
const kb = (size) => `${Math.max(1, Math.round(Number(size || 0) / 1024))} KB`;
function LeadDocumentsPanel({ lead }) {
  const [file, setFile] = useState(null); const [category, setCategory] = useState("GENERAL");
  const list = useLeadDocuments(lead?.id); const upload = useUploadDocument(); const remove = useDeleteDocument(lead?.id);
  const rows = list.data?.data?.documents || [];
  const submit = async () => { await upload.mutateAsync({ leadId: lead.id, file, category }); setFile(null); };
  return <div className="phase7-documents"><div className="phase7-document-upload"><Select id="doc-category" label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</Select><label className="field"><span>Private document</span><input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label><Button disabled={!file || upload.isPending} onClick={submit}>{upload.isPending ? "Uploading…" : "Upload"}</Button></div>{upload.error ? <div className="inline-error">{upload.error.message}</div> : null}<div className="phase7-document-list">{rows.map((doc) => <div key={doc.id} className="phase7-document-row"><div><Badge tone="info">{doc.category}</Badge><strong>{doc.originalName}</strong><span>{kb(doc.size)} · {new Date(doc.createdAt).toLocaleString("en-IN")}</span></div><div><Button size="sm" variant="secondary" onClick={() => window.open(documentsApi.downloadUrl(doc.id), "_blank", "noopener")}>Download</Button><Button size="sm" variant="danger" disabled={remove.isPending} onClick={() => remove.mutate(doc.id)}>Delete</Button></div></div>)}</div>{!list.isLoading && !rows.length ? <p className="table-subtext">No private documents attached to this lead.</p> : null}</div>;
}
export default LeadDocumentsPanel;
