import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ResidentPage from "@/pages/ResidentPage";
import VolunteerPage from "@/pages/VolunteerPage";
import WarehousePage from "@/pages/WarehousePage";
import OverviewPage from "@/pages/OverviewPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resident" element={<ResidentPage />} />
        <Route path="/volunteer" element={<VolunteerPage />} />
        <Route path="/warehouse" element={<WarehousePage />} />
        <Route path="/overview" element={<OverviewPage />} />
      </Routes>
    </Router>
  );
}
