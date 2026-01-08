import "../../styles/cta.css";
import ArrowIcon from "../../assets/arrow.png";
import { useNavigate } from "react-router-dom";

export function CTA() {
  const navigate = useNavigate();
  return (
    <section className="py-5">
      <div className="container">
        <div className="cta-bg rounded-4 text-center text-white p-5 position-relative overflow-hidden mx-auto cta-card">
          <h2 className="fw-bold">
            Ready to Transform Your Campus Experience?
          </h2>

          <p className="mt-2 mb-4">
            Join thousands of students already using CampusAI.
          </p>

          <button
      className="btn cta-btn d-inline-flex align-items-center gap-2"
      onClick={() => navigate("/chat")}
    >
      Get Started
      <img src={ArrowIcon} alt="" className="cta-btn-icon" />
    </button>
        </div>
      </div>
    </section>
  );
}
