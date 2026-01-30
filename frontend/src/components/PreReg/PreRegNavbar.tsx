import { useEffect, useState } from "react";
import "../../styles/prereg-navbar.css";
import Logo from "../../assets/graystone1.jpg";

export default function PreRegNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`prereg-navbar fixed-top ${scrolled ? "scrolled" : ""}`}>
      <div className="container prereg-navbar-inner">
        <div className="prereg-brand">
          <span className="prereg-logo-wrapper">
            <img src={Logo} alt="School Logo" className="prereg-navbar-logo" />
          </span>

          <div className="prereg-navbar-text">
            <div className="prereg-navbar-school">
              Graystone Institute of the Philippines
            </div>
            <div className="prereg-navbar-subtitle">
              Campus Virtual Information Assistant
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
