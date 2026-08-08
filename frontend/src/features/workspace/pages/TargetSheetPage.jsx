import WorkspacePlaceholderPage from "./WorkspacePlaceholderPage";
function TargetSheetPage() {
  return <WorkspacePlaceholderPage title="Target Sheet" subtitle="Date-wise CTA, stage and revenue targets with actual achievement." phase="Phase 3" readiness={[
    { index: "01", title: "Date-wise targets", description: "Date controls and table patterns are ready for target entry and editing." },
    { index: "02", title: "Team ownership", description: "Reusable select and badge patterns support assigned members and target status." },
    { index: "03", title: "Actual vs target", description: "Stat cards and table foundations are ready for calculated achievement." },
  ]} />;
}
export default TargetSheetPage;
