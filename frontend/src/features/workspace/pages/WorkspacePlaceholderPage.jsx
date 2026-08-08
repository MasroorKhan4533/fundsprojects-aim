import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import PageHeader from "../../../components/ui/PageHeader";

function WorkspacePlaceholderPage({ eyebrow = "AIM Workspace", title, subtitle, phase, readiness = [] }) {
  return (
    <main className="app-page">
      <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} actions={<Badge tone="info">Foundation ready</Badge>} />
      <div className="readiness-grid">
        {readiness.map((item) => (
          <Card key={item.title} className="readiness-card">
            <span className="readiness-index">{item.index}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </Card>
        ))}
      </div>
      <Card className="phase-ready-card">
        <EmptyState
          icon="check"
          title={`${title} shell is ready`}
          description={`Production UI routing and reusable components are in place. Functional ${title} data and workflows are scheduled for ${phase}.`}
          compact
        />
      </Card>
    </main>
  );
}

export default WorkspacePlaceholderPage;
