import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import HealthPortal from "../app/HealthPortal";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HealthPortal />
  </StrictMode>,
);
