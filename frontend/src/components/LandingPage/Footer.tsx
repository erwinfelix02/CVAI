import { useEffect, useState } from "react";
import "../../styles/footer.css";
import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { getGeneralSettings } from "../../api/settingsService";

export function Footer() {
  const [supportEmail, setSupportEmail] = useState("support@university.edu");
  const [schoolPhoneNumber, setSchoolPhoneNumber] = useState("+639123456789");
  const [schoolLocation, setSchoolLocation] = useState(
    "Dagupan City, Philippines",
  );

  useEffect(() => {
    (async () => {
      try {
        const data = await getGeneralSettings();

        if (data?.supportEmail) {
          setSupportEmail(data.supportEmail);
        }

        if (data?.schoolPhoneNumber) {
          setSchoolPhoneNumber(data.schoolPhoneNumber);
        }

        if (data?.schoolLocation) {
          setSchoolLocation(data.schoolLocation);
        }
      } catch (err) {
        console.warn("Failed to load footer settings");
      }
    })();
  }, []);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h5>About CampusAI</h5>
          <p>
            CampusAI is dedicated to empowering students through innovation,
            smart registration systems, and AI-powered academic tools.
          </p>
        </div>

        <div className="footer-section">
          <h5>Contact Us</h5>
          <p>
            <Phone size={16} /> {schoolPhoneNumber}
          </p>
          <p>
            <Mail size={16} /> {supportEmail}
          </p>
          <p>
            <Globe size={16} /> www.campusai.edu
          </p>
        </div>

        <div className="footer-section">
          <h5>Our Location</h5>
          <p>
            <MapPin size={16} /> {schoolLocation}
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2025 CampusAI. All Rights Reserved.</span>
        <span className="visiontech">Powered by VisionTech</span>
      </div>
    </footer>
  );
}