import { Routes, Route } from "react-router-dom";
import TopBar from "./components/TopBar.jsx";
import Today from "./pages/Today.jsx";
import Week from "./pages/Week.jsx";
import Plan from "./pages/Plan.jsx";

export default function App() {
  return (
    <div className="min-h-full">
      <TopBar />
      <Routes>
        <Route path="/" element={<Today />} />
        <Route path="/week" element={<Week />} />
        <Route path="/plan" element={<Plan />} />
      </Routes>
    </div>
  );
}
