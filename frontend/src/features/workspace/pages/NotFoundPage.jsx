import { Link } from "react-router-dom";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
function NotFoundPage() {
  return <main className="app-page"><EmptyState title="Page not found" description="This workspace route does not exist." action={<Link to="/app/aim-master"><Button>Return to AIM Master</Button></Link>} /></main>;
}
export default NotFoundPage;
