import "../../styles/features.css";
import SupportIcon from "../../assets/support.png";
import CourseIcon from "../../assets/course.png";
import ScheduleIcon from "../../assets/schedule.png";
import CampusIcon from "../../assets/campus.png";

export function Features() {
  const features = [
    {
      title: "24/7 Instant Support",
      desc: "Get answers anytime, day or night.",
      icon: SupportIcon,
    },
    {
      title: "Course Guidance",
      desc: "Personalized recommendations based on your goals.",
      icon: CourseIcon,
    },
    {
      title: "Smart Scheduling",
      desc: "Track deadlines, exams, and campus events.",
      icon: ScheduleIcon,
    },
    {
      title: "Campus Resources",
      desc: "Find clubs, facilities, and support services.",
      icon: CampusIcon,
    },
  ];

  return (
    <section className="bg-white py-5 reveal">
      <div className="container">
        <h2 className="features-title text-center mb-4 reveal delay-1">
          Everything You Need, In One Place
        </h2>

        <p className="features-subtitle text-center mb-5 reveal delay-2">
          From course selection to campus navigation, CampusAI has you covered.
        </p>

        <div className="row g-4 justify-content-center features-row">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`col-md-3 col-lg-3 reveal delay-${i + 3}`}
            >
              <div className="card h-100 border-1 shadow-sm rounded-4 feature-card">
                <div className="card-body text-center">
                  <img src={f.icon} alt="" className="feature-icon mb-3" />
                  <h5 className="fw-semibold">{f.title}</h5>
                  <p className="text-muted mb-0">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
