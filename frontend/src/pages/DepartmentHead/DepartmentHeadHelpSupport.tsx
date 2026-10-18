// ✅ src/pages/DepartmentHead/DepartmentHeadHelpSupport.tsx

import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Layers,
  Megaphone,
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
     HELP TOPICS FOR EXISTING MODULES ONLY
     ========================================================= */

  const helpTopics = useMemo<DetailedHelpTopic[]>(
    () => [
      {
        id: 1,
        title: "Using the Dashboard",
        description: "Monitor department metrics, stats, and quick overview",
        icon: LayoutDashboard,
        details: {
          overview: "The Dashboard serves as your main command center to view high-level summaries and statistics for your department.",
          steps: [
            "Click on 'Dashboard' in the sidebar to load your main overview.",
            "Review key summary cards including total students and active sections.",
            "Use quick action widgets to navigate directly to critical management tasks."
          ],
          proTip: "Check the dashboard daily for important notifications and summary updates.",
        }
      },
      {
        id: 2,
        title: "Managing Students",
        description: "View student profiles, records, and department enrollment",
        icon: Users,
        details: {
          overview: "The Students module allows you to view, search, and manage student lists enrolled under your department.",
          steps: [
            "Navigate to the 'Students' page from the sidebar navigation.",
            "Use the search bar or filters to find specific student records or IDs.",
            "Click on a student profile to inspect their detailed information and status."
          ],
          proTip: "Use clear search keywords like student names or ID numbers for faster lookups.",
        }
      },
      {
        id: 3,
        title: "Managing Sections",
        description: "Organize class sections, rosters, and groupings",
        icon: Layers,
        details: {
          overview: "Section management helps you oversee class groupings, track section capacities, and review assigned students.",
          steps: [
            "Open the 'Sections' page from the main menu.",
            "Browse through available sections or search by section code.",
            "Click on any section card or row to view its detailed roster and breakdown."
          ],
          proTip: "Ensure student counts match allocated section capacities to prevent overcrowding.",
        }
      },
      {
        id: 4,
        title: "Publishing Announcements",
        description: "Broadcast updates and notices to your department",
        icon: Megaphone,
        details: {
          overview: "Keep faculty and students informed by posting and broadcasting official department announcements.",
          steps: [
            "Go to the 'Announcements' module from the sidebar.",
            "Click on the option to create or publish a new announcement.",
            "Fill in your announcement title, target audience, and message content before posting."
          ],
          proTip: "Important notices pinned to the top ensure higher visibility among users.",
        }
      },
      {
        id: 5,
        title: "Submitting Support Tickets",
        description: "Report technical issues or administrative requests",
        icon: LifeBuoy,
        details: {
          overview: "Need technical assistance or system adjustments? Submit a support ticket directly to IT administrators.",
          steps: [
            "Click the 'Submit a Ticket' button at the top right of the Help page.",
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
        question: "How do I view student records?",
        answer: "Navigate to the 'Students' page from the left sidebar to browse or search for specific student records within your department.",
      },
      {
        id: 2,
        question: "Where can I check active sections?",
        answer: "You can view and manage all department sections by clicking on the 'Sections' module in the sidebar.",
      },
      {
        id: 3,
        question: "How do I post an announcement?",
        answer: "Go to the 'Announcements' page using the sidebar navigation and select the option to publish a new announcement.",
      },
      {
        id: 4,
        question: "How do I contact technical support?",
        answer: "Click the 'Submit a Ticket' button at the top right of the Help & Support page to report issues directly to IT administrators.",
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
            TOPIC DETAILS POPUP MODAL
            ===================================================== */}
        {selectedTopic && (
          <div 
            className="room-modal-overlay" 
            onClick={() => setSelectedTopic(null)}
          >
            <div 
              className="room-modal-content bg-white p-4 rounded shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="room-modal-header">
                <h3>
                  {selectedTopic.title}
                </h3>
                <button
                  type="button"
                  className="room-modal-close-btn"
                  onClick={() => setSelectedTopic(null)}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body Overview */}
              <p className="room-modal-overview">
                {selectedTopic.details.overview}
              </p>

              {/* Step-by-Step Guide */}
              {selectedTopic.details.steps && (
                <div className="room-modal-steps-container">
                  <h6>
                    Step-by-Step Guide:
                  </h6>
                  <ul className="room-modal-steps-list">
                    {selectedTopic.details.steps.map((step, idx) => (
                      <li key={idx} className="room-modal-step-item">
                        <CheckCircle size={16} color="#0b4d6b" className="room-modal-step-icon" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pro Tip Callout */}
              {selectedTopic.details.proTip && (
                <div className="room-modal-protip">
                  <strong>💡 Pro Tip:</strong> {selectedTopic.details.proTip}
                </div>
              )}

              {/* Modal Footer */}
              <div className="room-modal-footer">
                <button
                  type="button"
                  className="room-modal-action-btn"
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