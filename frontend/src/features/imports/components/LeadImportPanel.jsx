import { useState } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Select from "../../../components/ui/Select";
import { useLeadImportCommit, useLeadImportPreview } from "../hooks/useLeadImport";

const downloadErrors = (errors = []) => {
  const quote = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = ["Row,Company,Contact,Status,Errors", ...errors.map((row) => [row.rowNumber, row.companyName, row.contactName, row.status, (row.errors || []).join(" | ")].map(quote).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "fundsprojects-aim-import-errors.csv"; a.click(); URL.revokeObjectURL(url);
};

function LeadImportPanel({ users = [], currentUser }) {
  const [file, setFile] = useState(null); const [assignedTo, setAssignedTo] = useState(currentUser?.id || ""); const [preview, setPreview] = useState(null);
  const previewMutation = useLeadImportPreview(); const commitMutation = useLeadImportCommit();
  const runPreview = async () => { const result = await previewMutation.mutateAsync({ file, assignedTo }); setPreview(result.data.preview); };
  const commit = async () => { const result = await commitMutation.mutateAsync({ file, assignedTo }); setPreview(result.data.result); };
  if (currentUser?.role !== "ADMIN") return null;
  return <Card className="phase7-import-card">
    <div className="section-card-head"><span className="eyebrow">BULK DATA</span><h2>CSV / Excel Lead Import</h2><p>Admin-only import with validation, duplicate detection, row-level error report and permanent AIM lead IDs. Maximum 6,000 rows per file.</p></div>
    <div className="phase7-import-grid">
      <label className="field"><span>CSV / XLSX File</span><input type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(e) => { setFile(e.target.files?.[0] || null); setPreview(null); }} /></label>
      <Select id="import-owner" label="Assign imported leads to" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>{users.map((user) => <option key={user.id} value={user.id}>{user.fullName} · {user.userId}</option>)}</Select>
      <div className="phase7-import-actions"><Button variant="secondary" disabled={!file || !assignedTo || previewMutation.isPending} onClick={runPreview}>{previewMutation.isPending ? "Validating…" : "Preview & Validate"}</Button><Button disabled={!file || !preview || !preview.summary?.validRows || commitMutation.isPending} onClick={commit}>{commitMutation.isPending ? "Importing…" : `Import ${preview?.summary?.validRows || 0} Valid Rows`}</Button></div>
    </div>
    {(previewMutation.error || commitMutation.error) ? <div className="inline-error">{(previewMutation.error || commitMutation.error).message}</div> : null}
    {preview ? <div className="phase7-import-summary"><div><strong>{preview.summary.totalRows}</strong><span>Total</span></div><div><strong>{preview.summary.validRows}</strong><span>Valid</span></div><div><strong>{preview.summary.duplicateRows}</strong><span>Duplicates</span></div><div><strong>{preview.summary.invalidRows}</strong><span>Invalid</span></div>{preview.imported !== undefined ? <div><strong>{preview.imported}</strong><span>Imported</span></div> : null}<Button size="sm" variant="ghost" disabled={!preview.errors?.length} onClick={() => downloadErrors(preview.errors)}>Download Error Report</Button></div> : null}
  </Card>;
}
export default LeadImportPanel;
