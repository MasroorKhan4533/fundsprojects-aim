import { useEffect } from "react";
import AppIcon from "./AppIcon";

function Drawer({ open, title, description, children, footer, onClose, side = "right" }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => { if (event.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
      <aside className={`drawer drawer-${side}`} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <header className="drawer-header">
          <div><h2 id="drawer-title">{title}</h2>{description ? <p>{description}</p> : null}</div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close drawer"><AppIcon name="close" /></button>
        </header>
        <div className="drawer-body">{children}</div>
        {footer ? <footer className="drawer-footer">{footer}</footer> : null}
      </aside>
    </div>
  );
}

export default Drawer;
