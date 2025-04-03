import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { WorkSessionProvider } from "@/context/WorkSessionContext";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <ProjectProvider>
      <WorkSessionProvider>
        <App />
      </WorkSessionProvider>
    </ProjectProvider>
  </ThemeProvider>
);
