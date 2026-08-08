import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppProviders from "./app/providers";
import "./styles/global.css";
import "./styles/design-system.css";
import "./styles/auth.css";
import "./styles/workspace.css";

createRoot(document.getElementById("root")).render(<StrictMode><AppProviders /></StrictMode>);
