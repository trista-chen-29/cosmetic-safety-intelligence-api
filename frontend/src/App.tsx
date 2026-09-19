import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/Home";
import { ResultPage } from "./pages/Result";
import { SavedPage } from "./pages/Saved";
import { SavedDetailPage } from "./pages/SavedDetail";
import { ScanPage } from "./pages/Scan";
import { SessionProvider } from "./state/session";

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/saved/:id" element={<SavedDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}
