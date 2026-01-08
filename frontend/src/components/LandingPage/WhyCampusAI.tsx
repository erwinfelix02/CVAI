import { useNavigate } from "react-router-dom";

import Button from "../Authentication/Button";
import CheckIcon from "../../assets/check.png";
import "../../styles/whycampus.css";
import CampusIcon from "../../assets/graduation.png";
import ArrowIcon from "../../assets/arrow-right.png";

export function WhyCampusAI() {
  const navigate = useNavigate();

  return (
    <section className="why-gradient">
      <div className="container">
        <div className="row align-items-center justify-content-center g-5">
          <div className="col-md-4">
            <h2 className="fw-bold mb-4 why-title text-center text-md-start">
              Why Students Love CampusAI
            </h2>

            <ul className="list-unstyled text-muted why-list">
              <li className="mb-2 d-flex align-items-start gap-2">
                <img src={CheckIcon} alt="" width={18} height={18} />
                <span>Instant answers without searching multiple websites</span>
              </li>
              <li className="mb-2 d-flex align-items-start gap-2">
                <img src={CheckIcon} alt="" width={18} height={18} />
                <span>Personalized recommendations based on your profile</span>
              </li>
              <li className="mb-2 d-flex align-items-start gap-2">
                <img src={CheckIcon} alt="" width={18} height={18} />
                <span>Never miss deadlines with smart reminders</span>
              </li>
              <li className="mb-2 d-flex align-items-start gap-2">
                <img src={CheckIcon} alt="" width={18} height={18} />
                <span>Easy access to campus resources and support</span>
              </li>
            </ul>

            <div className="text-center text-md-start mt-4">
              <Button
                className="px-4 d-inline-flex align-items-center gap-2"
                onClick={() => navigate("/admin/dashboard")}
              >
                Join Your Classmates
                <img src={ArrowIcon} alt="" width={16} height={16} />
              </Button>
            </div>
          </div>

          <div className="col-md-4">
            <div className="bg-white shadow-sm rounded-4 p-4">
              {/* Header */}
              <div className="mb-3 d-flex align-items-center gap-3">
                <div className="navbar-logo-wrapper flex-shrink-0">
                  <img src={CampusIcon} alt="" width={18} height={18} />
                </div>

                <div>
                  <h6 className="fw-bold mb-1">Campus AI</h6>
                  <p className="text-muted mb-0 small">Your Academic Partner</p>
                </div>
              </div>

              {/* Quote */}
              <p className="fst-italic text-muted mb-3 why-quote">
                “CampusAI helped me navigate my first semester like a pro. From
                finding the right courses to discovering study groups, it’s been
                invaluable.”
              </p>

              {/* Footer */}
              <div className="fw-semibold text-start">+10,000 students</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
