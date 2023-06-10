import React from "react";
import ReactDOM from "react-dom/client";
import ExtensionPopup from "./extension/extension_popup.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ExtensionPopup />
  </React.StrictMode>,
);
