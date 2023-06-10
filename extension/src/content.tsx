import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cssom, observe, twind } from "@twind/core";
import "construct-style-sheets-polyfill";
import React from "react";
import ReactDOM from "react-dom/client";
import config from "../twind.config";
import "./index.css";
import { LegereApp } from "./pages/legere";

const host = document.createElement("div");
host.id = "legere-host";
document.body.appendChild(host);
host.style.zIndex = "9999999";

const sheet = cssom(new CSSStyleSheet());
const tw = twind(config, sheet);

const shadowRoot = host.attachShadow({ mode: "open" });

if (!shadowRoot) throw new Error("Shadow root not found");

shadowRoot.adoptedStyleSheets = [sheet.target];

let link = document.createElement("link");
link.setAttribute("rel", "stylesheet");
link.setAttribute(
  "href",
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
);
host.appendChild(link);

observe(tw, shadowRoot);

const root = document.createElement("div");
root.id = "legere-shadow-root";
shadowRoot.appendChild(root);

const queryClient = new QueryClient();

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <LegereApp />
    </QueryClientProvider>
  </React.StrictMode>,
);
