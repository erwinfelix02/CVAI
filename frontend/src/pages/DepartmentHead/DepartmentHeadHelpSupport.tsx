// ✅ src/pages/DepartmentHead/DepartmentHeadHelpSupport.tsx

import { useMemo, useState } from "react";
import {
  Users,
  CalendarDays,
  DoorOpen,
  BookOpen,
  Search,
  LifeBuoy,
  X,
  CheckCircle,
} from "lucide-react";

import HelpTopicCard, {
  type HelpTopic,
} from "../../components/DepartmentHead/HelpSupport/HelpTopicCard";

import FAQCard, {
  type FAQItem,
} from "../../components/DepartmentHead/HelpSupport/FAQCard";

import SubmitTicketModal from "../../components/DepartmentHead/HelpSupport/SubmitTicketModal";
import AuthAlert from "../../components/Authentication/AuthAlert";

import "../../styles/department-headHelpSupport.css";

// Extended Help Topic interface with detailed guide information
export interface DetailedHelpTopic extends HelpTopic {
  details: {
    overview: string;
    steps: string[];
    proTip?: string;
  };
}

export default function DepartmentHeadHelpSupport() {
  const [search, setSearch] = useState("");
  const [showTicketModal, setShowTicketModal] = useState(false);
  
  // State for the selected Help Topic Modal
  const [selectedTopic, setSelectedTopic] = useState<DetailedHelpTopic | null>(null);

  // AuthAlert states
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success">("success");
  const [alertVisible, setAlertVisible] = useState(false);

  const showAlert = (message: string, type: "error" | "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 4000);
  };

  /* =========================================================
     HELP TOPICS WITH RICH INSTRUCTIONAL CONTENT
     ========================================================= */

  const helpTopics = useMemo<DetailedHelpTopic[]>(
    () => [
      {
        id: 1,
        title: "Managing Faculty Loads",
        description: "Balance teaching units and monitor faculty assignments",
        icon: Users,
        details: {
          overview: "Faculty load management helps you ensure that instructors are assigned within their contractual unit capacities without overloading.",
          steps: [
            "Navigate to the Faculty Load section from your department dashboard.",
            "Review current lecture and laboratory units assigned to each instructor.",
            "Verify that total units do not exceed the institutional maximum limit (default: 21 units).",
            "Reassign subjects if an instructor is over-allocated."
          ],
          proTip: "Check your department settings if you need to adjust the maximum teaching load thresholds.",
        }
      },
      {
        id: 2,
        title: "Creating Schedules",
        description: "Assign subjects, faculty, rooms, and time slots",
        icon: CalendarDays,
        details: {
          overview: "Create and organize class timetables efficiently while avoiding double-booking rooms or faculty.",
          steps: [
            "Go to Schedule Management and click 'Create Schedule'.",
            "Select the target subject code and curriculum year section.",
            "Assign an available faculty member with matching expertise.",
            "Choose an unreserved room and designate the meeting days and time slots."
          ],
          proTip: "The system automatically flags conflicting time slots or room overlaps upon creation.",
        }
      },
      {
        id: 3,
        title: "Allocating Rooms",
        description: "Track utilization, schedules, and free room slots",
        icon: DoorOpen,
        details: {
          overview: "Monitor room capacity, lecture/laboratory types, and real-time weekly utilization percentages.",
          steps: [
            "Open the Room Allocation page to see all department-assigned rooms.",
            "Click 'View Schedule' on any room card to inspect active class timetables.",
            "Check the progress bar indicator to spot under-utilized or overcrowded spaces."
          ],
          proTip: "Rooms with utilization rates above 85% are highlighted in red to indicate high demand.",
        }
      },
      {
        id: 4,
        title: "Managing Subject Offerings",
        description: "Maintain the curriculum and course catalog",
        icon: BookOpen,
        details: {
          overview: "Keep your program's curriculum updated with active courses, prerequisites, and unit distributions.",
          steps: [
            "Access the Subject Offerings module in your department portal.",
            "Review semester course lists for BSIT or associated programs.",
            "Add newly approved subjects or update existing course descriptions."
          ],
        }
      },
      {
        id: 5,
        title: "Resolving Conflicts",
        description: "Detect and fix overlapping room or faculty schedules",
        icon: CalendarDays,
        details: {
          overview: "Quickly pinpoint scheduling clashes where two classes occupy the same room or instructor simultaneously.",
          steps: [
            "Check the Schedule Conflicts tab on your dashboard.",
            "Review the conflicting time slots, rooms, and competing subject codes.",
            "Select a resolution option such as moving the class to another room or altering the time slot."
          ],
        }
      },
      {
        id: 6,
        title: "Submitting Support Tickets",
        description: "Report technical issues or administrative requests",
        icon: LifeBuoy,
        details: {
          overview: "Need technical assistance or system adjustments? Submit a support ticket directly to IT administrators.",
          steps: [
            "Click the 'Submit a Ticket' button at the top of the Help page.",
            "Fill out your subject, issue category, and detailed description.",
            "Submit the form to receive confirmation and tracking updates."
          ],
        }
      },
    ],
    []
  );

  const faqItems = useMemo<FAQItem[]>(
    () => [
      {
        id: 1,
        question: "How do I resolve a schedule conflict?",
        answer: "Review the conflicting faculty, room, subject, and time slot in the schedule. Adjust the assignment to an available room or time slot, then save the updated schedule.",
      },
      {
        id: 2,
        question: "What is the maximum teaching load?",
        answer: "The maximum teaching load is based on the department preference configured in Settings. The default maximum teaching load is 21 units.",
      },
      {
        id: 3,
        question: "Can I add a new room?",
        answer: "Yes. Open Room Allocation and use the room request option to submit a new room request. The room can then be reviewed and added to the available rooms.",
      },
      {
        id: 4,
        question: "How do I assign a faculty member to a subject?",
        answer: "Open the schedule management page, select the subject, and choose an available faculty member. Make sure the faculty member's teaching load does not exceed the configured maximum.",
      },
      {
        id: 5,
        question: "How do I create a new schedule?",
        answer: "Open Schedule Management and create a schedule by selecting the subject, faculty member, room, meeting days, and time slot.",
      },
      {
        id: 6,
        question: "Where can I view faculty teaching loads?",
        answer: "Faculty teaching loads can be viewed from the Department Head Dashboard or the faculty load management page.",
      },
    ],
    []
  );

  const filteredTopics = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return helpTopics;
    return helpTopics.filter(
      (topic) =>
        topic.title.toLowerCase().includes(keyword) ||
        topic.description.toLowerCase().includes(keyword)
    );
  }, [helpTopics, search]);

  const filteredFAQs = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return faqItems;
    return faqItems.filter(
      (faq) =>
        faq.question.toLowerCase().includes(keyword) ||
        faq.answer.toLowerCase().includes(keyword)
    );
  }, [faqItems, search]);

  const handleTopicClick = (topic: HelpTopic) => {
    const detailed = helpTopics.find((t) => t.id === topic.id);
    if (detailed) {
      setSelectedTopic(detailed);
    }
  };

  return (
    <main className="department-help-page">
      <div className="department-help-content">
        <div className="help-page-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="help-page-header-content">
            <h1>Help &amp; Support</h1>
            <p>Guides and answers for department head tasks</p>
          </div>

          <button
            type="button"
            className="btn text-white px-4 py-2 d-inline-flex align-items-center justify-content-center gap-2 shadow-sm align-self-start align-self-md-auto"
            style={{ backgroundColor: "#0b4d6b", borderRadius: "8px", fontWeight: 500 }}
            onClick={() => setShowTicketModal(true)}
          >
            <LifeBuoy size={16} /> Submit a Ticket
          </button>
        </div>

        <div className="mb-3">
          <AuthAlert 
            message={alertMessage} 
            type={alertType} 
            visible={alertVisible} 
            loading={false} 
          />
        </div>

        <div className="help-search-wrapper">
          <div className="help-search">
            <Search size={21} strokeWidth={1.8} className="help-search-icon" />
            <input
              type="text"
              className="help-search-input"
              placeholder="Search help topics or FAQs..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search help topics"
            />
          </div>
        </div>

        {/* Help Topics Grid */}
        <div className="help-topics-section">
          {filteredTopics.length > 0 ? (
            <div className="help-topics-grid">
              {filteredTopics.map((topic) => (
                <div className="help-topic-column" key={topic.id}>
                  <HelpTopicCard topic={topic} onClick={handleTopicClick} />
                </div>
              ))}
            </div>
          ) : (
            <div className="help-empty-state">
              <h5>No help topics found</h5>
              <p>Try searching for another topic.</p>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="faq-section mt-4">
          {filteredFAQs.length > 0 ? (
            <div className="faq-wrapper">
              <FAQCard items={filteredFAQs} />
            </div>
          ) : (
            <div className="help-empty-state">
              <h5>No frequently asked questions found</h5>
              <p>Try searching for another question or clearing your filter.</p>
            </div>
          )}
        </div>

        {/* =====================================================
            TOPIC DETAILS POPUP MODAL (Clean Single-Row Header)
            ===================================================== */}
        {selectedTopic && (
          <div 
            className="room-modal-overlay" 
            onClick={() => setSelectedTopic(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1050,
              padding: "1rem"
            }}
          >
            <div 
              className="bg-white p-4 rounded shadow-lg"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "550px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}
            >
              {/* Modal Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#1f2937" }}>
                  {selectedTopic.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedTopic(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6b7280"
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body Overview */}
              <p style={{ color: "#4b5563", fontSize: "0.95rem", marginBottom: "1.25rem", lineHeight: "1.5" }}>
                {selectedTopic.details.overview}
              </p>

              {/* Step-by-Step Guide */}
              {selectedTopic.details.steps && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <h6 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.75rem", fontSize: "0.95rem" }}>
                    Step-by-Step Guide:
                  </h6>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {selectedTopic.details.steps.map((step, idx) => (
                      <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "#1f2937", fontSize: "0.9rem", lineHeight: "1.4" }}>
                        <CheckCircle size={16} color="#0b4d6b" style={{ marginTop: "0.15rem", flexShrink: 0 }} />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pro Tip Callout */}
              {selectedTopic.details.proTip && (
                <div 
                  style={{ 
                    padding: "0.75rem 1rem", 
                    borderRadius: "6px", 
                    marginBottom: "1.25rem", 
                    backgroundColor: "#f0fdf4", 
                    border: "1px solid #bbf7d0", 
                    color: "#166534", 
                    fontSize: "0.85rem",
                    lineHeight: "1.4"
                  }}
                >
                  <strong>💡 Pro Tip:</strong> {selectedTopic.details.proTip}
                </div>
              )}

              {/* Modal Footer */}
              <div style={{ textAlign: "right", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  style={{
                    backgroundColor: "#0b4d6b",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.5rem 1.25rem",
                    fontWeight: 500,
                    cursor: "pointer"
                  }}
                  onClick={() => setSelectedTopic(null)}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Support Ticket Modal */}
        {showTicketModal && (
          <SubmitTicketModal
            onClose={() => setShowTicketModal(false)}
            onSuccess={() => showAlert("Support ticket submitted successfully!", "success")}
            onError={(msg) => showAlert(msg, "error")}
          />
        )}
      </div>
    </main>
  );
}