import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import Button from "../Authentication/Button";
import "../../styles/navbar.css";
import Logo from "../../assets/graystone1.jpg";
import { getGeneralSettings } from "../../api/settingsService";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // ✅ dynamic branding state
  const [siteName, setSiteName] = useState(
    "Graystone Institute of the Philippines"
  );
  const [siteDescription, setSiteDescription] = useState(
    "Campus Virtual Assistance for Information"
  );

  // scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ fetch general settings
  useEffect(() => {
    (async () => {
      try {
        const data = await getGeneralSettings();

        if (data?.siteName) {
          setSiteName(data.siteName);
        }

        if (data?.siteDescription) {
          setSiteDescription(data.siteDescription);
        }
      } catch (err) {
        console.warn("Failed to load general settings");
      }
    })();
  }, []);

  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top ${
        scrolled ? "scrolled" : ""
      }`}
    >
      <div className="container py-2 d-flex align-items-center">
        {/* BRAND */}
        <button
          className="navbar-brand d-flex align-items-center gap-3 btn btn-link p-0"
          onClick={() => navigate("/")}
        >
          <span className="navbar-logo-wrapper">
            <img src={Logo} alt="CampusAI logo" className="navbar-logo" />
          </span>

          <div className="navbar-text text-start">
            <div className="navbar-school">{siteName}</div>
            <div className="navbar-title">{siteDescription}</div>
          </div>
        </button>

        {/* ACTION BUTTONS */}
        <div className="ms-auto d-flex gap-2 align-items-center">
          <Button
            variant="white"
            className="px-3 navbar-signin"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </Button>

          <Button
            className="navbar-cta px-4 d-inline-flex align-items-center gap-2"
            onClick={() => navigate("/prereg")}
          >
            Register Now
            <ArrowRight size={18} strokeWidth={2} />
          </Button>
        </div>
      </div>
    </nav>
  );
}