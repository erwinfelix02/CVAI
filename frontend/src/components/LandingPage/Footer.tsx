import { useEffect, useState } from "react";
import "../../styles/footer.css";
import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { getGeneralSettings } from "../../api/settingsService";

export function Footer() {
  const [supportEmail, setSupportEmail] = useState("info@campusai.edu");

  useEffect(() => {
    (async () => {
      try {
        const data = await getGeneralSettings();
        if (data?.supportEmail) {
          setSupportEmail(data.supportEmail);
        }
      } catch (err) {
        console.warn("Failed to load support email");
      }
    })();
  }, []);

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About */}
        <div className="footer-section">
          <h5>About CampusAI</h5>
          <p>
            CampusAI is dedicated to empowering students through innovation,
            smart enrollment systems, and AI-powered academic tools.
          </p>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h5>Contact Us</h5>
          <p>
            <Phone size={16} /> +63 912 345 6789
          </p>
          <p>
            <Mail size={16} /> {supportEmail}
          </p>
          <p>
            <Globe size={16} /> www.campusai.edu
          </p>
        </div>

        {/* Location */}
        <div className="footer-section">
          <h5>Our Location</h5>
          <p>
            <MapPin size={16} /> 123 University Ave,
            <br />
            City of Innovation,
            <br />
            Philippines 1000
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <span>© 2025 CampusAI. All Rights Reserved.</span>
        <span className="visiontech">Powered by VisionTech</span>
      </div>
    </footer>
  );
}
