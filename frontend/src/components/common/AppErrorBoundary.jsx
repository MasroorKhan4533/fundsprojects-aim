import React from "react";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error("Application render error", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="fatal-state">
          <div className="surface-card fatal-card">
            <span className="eyebrow">FundsProjects AIM</span>
            <h1>Something went wrong.</h1>
            <p>The application encountered an unexpected rendering error.</p>
            <button type="button" className="button button-primary" onClick={() => window.location.reload()}>
              Reload application
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
