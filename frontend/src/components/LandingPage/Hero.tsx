import { useNavigate } from "react-router-dom";

import Button from "../Authentication/Button";
import "../../styles/hero.css";
import ChatIcon from "../../assets/chat.png";
import AiIcon from "../../assets/ai.png";
import ChatPreview from "./ChatPreview";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero-section text-center position-relative overflow-hidden">
      <div className="container py-5">
        <span className="hero-badge mb-3">
          <img src={AiIcon} alt="" className="badge-icon" />
          AI-Powered Campus Assistant
        </span>

        <h1 className="hero-title mt-3">
          Your Smart Companion for <br />
          <span className="hero-highlight">Campus Life</span>
        </h1>

        <p className="lead mt-3 mx-auto hero-text" style={{ maxWidth: 720 }}>
          Get instant answers about courses, schedules, campus resources, and
          everything you need for academic success. Available 24/7, just for
          you.
        </p>

        <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3 mt-4">
          <Button
            className="hero-cta px-4 d-inline-flex align-items-center gap-2"
            onClick={() => navigate("/signin")}
          >
            Start Chatting Now
            <img src={ChatIcon} alt="" className="btn-icon" />
          </Button>

          <Button variant="whiteBorder" className="hero-demo">
            Watch Demo
          </Button>
        </div>

        {/* Chat Preview */}
        <div className="mt-5 d-flex justify-content-center">
          <ChatPreview />
        </div>
      </div>
    </section>
  );
}
