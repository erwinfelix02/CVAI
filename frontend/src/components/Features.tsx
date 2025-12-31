import "../styles/features.css";
import SupportIcon from "../assets/support.png";
import CourseIcon from "../assets/course.png";
import ScheduleIcon from "../assets/schedule.png";
import CampusIcon from "../assets/campus.png";

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
    <section className="bg-white py-5">
      <div className="container">
        <h2 className="features-title text-center mb-4">
          Everything You Need, In One Place
        </h2>

        <p className="features-subtitle text-center mb-5">
          From course selection to campus navigation, CampusAI has you covered.
        </p>

        <div className="row g-4 justify-content-center features-row">
          {features.map((f) => (
            <div key={f.title} className="col-md-6 col-lg-3">
              <div className="card h-100 border-1 shadow-sm rounded-4">
                <div className="card-body">
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
