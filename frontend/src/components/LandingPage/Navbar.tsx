import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import Button from "../Authentication/Button";
import "../../styles/navbar.css";
import Logo from "../../assets/graystone1.jpg";
import { getGeneralSettings } from "../../api/settingsService";

type GeneralSettings = {
  siteName?: string;
  siteDescription?: string;
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const navigate = useNavigate();

  const [siteName, setSiteName] = useState<string>(
    "Graystone Institute of the Philippines",
  );
  const [siteDescription, setSiteDescription] = useState<string>(
    "Campus Virtual Assistant for Information",
  );

  useEffect(() => {
    const onScroll = (): void => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const loadGeneralSettings = async (): Promise<void> => {
      try {
        const data = (await getGeneralSettings()) as GeneralSettings;

        if (data?.siteName) {
          setSiteName(data.siteName);
        }

        if (data?.siteDescription) {
          setSiteDescription(data.siteDescription);
        }
      } catch (error) {
        console.warn("Failed to load general settings", error);
      }
    };

    void loadGeneralSettings();
  }, []);

  return (
    <nav className={`navbar fixed-top ${scrolled ? "scrolled" : ""}`}>
      <div className="container navbar-container">
        <button
          type="button"
          className="navbar-brand btn btn-link p-0"
          onClick={() => navigate("/")}
          aria-label="Go to home page"
        >
          <span className="navbar-logo-wrapper">
            <img src={Logo} alt="CampusAI logo" className="navbar-logo" />
          </span>

          <div className="navbar-text">
            <div className="navbar-school">{siteName}</div>
            <div className="navbar-title">{siteDescription}</div>
          </div>
        </button>

        <div className="navbar-actions">
          <Button
            variant="white"
            className="navbar-signin"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </Button>

          <Button
            className="navbar-cta"
            onClick={() => navigate("/prereg")}
          >
            <span>Register Now</span>
            <ArrowRight size={16} strokeWidth={2.2} />
          </Button>
        </div>
      </div>
    </nav>
  );
}