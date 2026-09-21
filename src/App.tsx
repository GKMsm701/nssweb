import { useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { SiteProvider } from "./context/SiteContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Activities from "./pages/Activities";
import Team from "./pages/Team";
import News from "./pages/News";
import Gallery from "./pages/Gallery";
import Achievements from "./pages/Achievements";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";

import VolunteerPortal from "./pages/VolunteerPortal";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname === "/admin";

  // Secret keyboard shortcut: Ctrl + Shift + A opens the Admin Portal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        navigate("/admin");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className="app-shell">
      {!isAdminRoute && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/volunteer" element={<VolunteerPortal />} />
          <Route path="/team" element={<Team />} />
          <Route path="/news" element={<News />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <SiteProvider>
      <AppContent />
    </SiteProvider>
  );
}