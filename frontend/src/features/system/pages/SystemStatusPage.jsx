import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Spinner from "../../../components/ui/Spinner";
import { useSystemHealth } from "../hooks/useSystemHealth";

function SystemStatusPage() {
  const health = useSystemHealth();
  const database = health.data?.data?.database;

  return (
    <div className="foundation-page">
      <header className="foundation-hero">
        <div>
          <span className="eyebrow">FundsProjects AIM · Production V1</span>
          <h1>Engineering foundation</h1>
          <p>React → React Query → Express → MongoDB foundation is active and ready for production feature bundles.</p>
        </div>
        <div className="foundation-badge">Bundle 0</div>
      </header>

      <div className="foundation-grid">
        <Card className="status-card">
          <div className="status-card-head">
            <div>
              <span className="eyebrow">Local environment</span>
              <h2>System readiness</h2>
            </div>
            <Button variant="secondary" onClick={() => health.refetch()} disabled={health.isFetching}>
              Recheck
            </Button>
          </div>

          {health.isLoading ? <Spinner label="Checking API and MongoDB" /> : null}
          {health.isError ? (
            <Alert tone="danger" title="Foundation is not ready">
              {health.error.message}
              {health.error.requestId ? ` · Request ID: ${health.error.requestId}` : ""}
            </Alert>
          ) : null}
          {health.isSuccess ? (
            <Alert tone="success" title="Foundation is ready">
              API is reachable and MongoDB reports {database?.state || "unknown"}.
            </Alert>
          ) : null}

          <dl className="status-list">
            <div><dt>Frontend</dt><dd>React 19 + Vite</dd></div>
            <div><dt>Server state</dt><dd>TanStack React Query</dd></div>
            <div><dt>Client state</dt><dd>Zustand</dd></div>
            <div><dt>Backend</dt><dd>Express 5</dd></div>
            <div><dt>Database</dt><dd>{database?.database || "fundsprojects_aim"}</dd></div>
            <div><dt>Database state</dt><dd>{database?.state || (health.isLoading ? "checking" : "unavailable")}</dd></div>
          </dl>
        </Card>

        <Card className="status-card">
          <span className="eyebrow">Engineering standard</span>
          <h2>Foundation guarantees</h2>
          <ul className="check-list">
            <li>Strict environment validation</li>
            <li>MongoDB connection pooling</li>
            <li>Request IDs and structured logging</li>
            <li>Security headers and API rate limiting</li>
            <li>Standardized API success/error contracts</li>
            <li>Graceful process shutdown</li>
            <li>Reusable frontend primitives</li>
            <li>Centralized API transport</li>
            <li>Automated lint, test and build checks</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default SystemStatusPage;
