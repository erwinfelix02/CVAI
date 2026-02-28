import { useEffect, useState } from "react";
import "../../styles/prereg-navbar.css";
import Logo from "../../assets/graystone1.jpg";
import { getGeneralSettings } from "../../api/settingsService";

export default function PreRegNavbar() {
  const [scrolled, setScrolled] = useState(false);

  // ✅ dynamic branding
  const [siteName, setSiteName] = useState(
    "Graystone Institute of the Philippines"
  );
  const [siteDescription, setSiteDescription] = useState(
    "Campus Virtual Assistant for Information"
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
    <nav className={`prereg-navbar fixed-top ${scrolled ? "scrolled" : ""}`}>
      <div className="container prereg-navbar-inner">
        <div className="prereg-brand">
          <span className="prereg-logo-wrapper">
            <img src={Logo} alt="School Logo" className="prereg-navbar-logo" />
          </span>

          <div className="prereg-navbar-text">
            <div className="prereg-navbar-school">{siteName}</div>
            <div className="prereg-navbar-subtitle">
              {siteDescription}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}