import AppIcon from "./AppIcon";
import Button from "./Button";

function ErrorState({ title = "Something went wrong", message = "Please try again.", onRetry }) {
  return (
    <div className="error-state" role="alert">
      <span className="error-state-icon"><AppIcon name="alert" size={24} /></span>
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry ? <Button variant="secondary" onClick={onRetry}>Try again</Button> : null}
    </div>
  );
}

export default ErrorState;
