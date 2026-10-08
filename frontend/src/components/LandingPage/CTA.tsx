import "../../styles/cta.css";
import ArrowIcon from "../../assets/arrow.png";
import { useNavigate } from "react-router-dom";

export function CTA() {
  const navigate = useNavigate();

  return (
    <section className="py-5 reveal">
      <div className="container">
        <div className="cta-bg rounded-4 text-center text-white p-5 position-relative overflow-hidden mx-auto cta-card reveal delay-1">
          
          <h2 className="fw-bold reveal delay-2">
            Ready to Transform Your Campus Experience?
          </h2>

          <p className="mt-2 mb-4 reveal delay-3">
            Join thousands of students already using CampusAI.
          </p>

          <button
            className="btn cta-btn d-inline-flex align-items-center gap-2 reveal delay-4"
            onClick={() => navigate("/prereg")}
          >
            Register Now
            <img src={ArrowIcon} alt="" className="cta-btn-icon" />
          </button>

        </div>
      </div>
    </section>
  );
}
