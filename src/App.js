// src/App.js
// HashRouter is required for GitHub Pages — it doesn't support client-side routing.
// URLs will look like: your-org.github.io/ui-interview-assessment/#/candidate
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import CandidatePage   from "./pages/CandidatePage";
import InterviewerPage from "./pages/InterviewerPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/candidate"   element={<CandidatePage />} />
        <Route path="/interviewer" element={<InterviewerPage />} />
        <Route path="*"            element={<Navigate to="/candidate" replace />} />
      </Routes>
    </HashRouter>
  );
}
