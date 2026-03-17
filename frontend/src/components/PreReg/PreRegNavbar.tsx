import { useEffect, useState } from "react";
import "../../styles/prereg-navbar.css";
import Logo from "../../assets/graystone1.jpg";
import { getGeneralSettings } from "../../api/settingsService";

type GeneralSettings = {
  siteName?: string;
  siteDescription?: string;
};

export default function PreRegNavbar() {
  const [scrolled, setScrolled] = useState<boolean>(false);

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
    <nav className={`prereg-navbar fixed-top ${scrolled ? "scrolled" : ""}`}>
      <div className="container prereg-navbar-inner">
        <div className="prereg-brand">
          <span className="prereg-logo-wrapper">
            <img
              src={Logo}
              alt="School Logo"
              className="prereg-navbar-logo"
            />
          </span>

          <div className="prereg-navbar-text">
            <div className="prereg-navbar-school">{siteName}</div>
            <div className="prereg-navbar-subtitle">{siteDescription}</div>
          </div>
        </div>
      </div>
    </nav>
  );
}