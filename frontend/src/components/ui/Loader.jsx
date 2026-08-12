import Spinner from "./Spinner";

function Loader({ label = "Loading", fullPage = false }) {
  return <div className={fullPage ? "loader-state loader-state-page" : "loader-state"}><Spinner label={label} /></div>;
}

export default Loader;
