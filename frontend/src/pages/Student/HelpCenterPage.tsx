// ✅ src/components/Student/Help/HelpCenterPage.tsx

import { useState, useMemo } from "react";
import { 
  Search, 
  Megaphone, 
  BookOpen, 
  Calendar, 
  User, 
  ChevronRight, 
  LifeBuoy, 
  Send 
} from "lucide-react";
import AuthAlert from "../../components/Authentication/AuthAlert";

export type HelpTopic = {
  id: string;
  title: string;
  description: string;
};

export type HelpCategorySection = {
  key: string;
  title: string;
  icon: any;
  topics: HelpTopic[];
};

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  
  // AuthAlert states
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success">("success");
  const [alertVisible, setAlertVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states for the support ticket modal
  const [ticketCategory, setTicketCategory] = useState("");
  const [ticketPriority, setTicketPriority] = useState("Normal");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");

  const showAlert = (message: string, type: "error" | "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 4000);
  };

  const categories: HelpCategorySection[] = useMemo(
    () => [
      {
        key: "announcements",
        title: "Announcements",
        icon: Megaphone,
        topics: [
          { id: "a1", title: "I can't find an announcement", description: "Where announcements live and how to search them" },
          { id: "a2", title: "How to pin or unpin an announcement", description: "Keep important announcements at the top of your list" },
          { id: "a3", title: "Announcement text looks cut off", description: "How to read the full message" },
        ],
      },
      {
        key: "courses",
        title: "Courses & Materials",
        icon: BookOpen,
        topics: [
          { id: "c1", title: "My teacher's material is not showing", description: "Why an upload may not appear under your course" },
          { id: "c2", title: "Download is not working", description: "What to do when a file won't download" },
          { id: "c3", title: "A subject is missing from My Courses", description: "Why a subject may not be listed" },
        ],
      },
      {
        key: "attendance",
        title: "Attendance",
        icon: Calendar,
        topics: [
          { id: "at1", title: "How to excuse an absence", description: "Submit a request for an absence to be excused" },
          { id: "at2", title: "My attendance record looks wrong", description: "What to do when a mark doesn't match reality" },
          { id: "at3", title: "I was marked late but I wasn't", description: "Fixing a wrong 'Late' mark" },
        ],
      },
      {
        key: "account",
        title: "Account & Profile",
        icon: User,
        topics: [
          { id: "ac1", title: "I forgot my password", description: "Reset your password with an email code" },
          { id: "ac2", title: "How to update my profile", description: "Change your profile details" },
          { id: "ac3", title: "My account is locked or inactive", description: "When you can't log in at all" },
        ],
      },
    ],
    []
  );

  // Filter topics based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        topics: cat.topics.filter(
          (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.topics.length > 0);
  }, [searchQuery, categories]);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!userStr) {
        showAlert("Session expired. Please sign in again.", "error");
        setSubmitting(false);
        return;
      }

      const user = JSON.parse(userStr);
      
      const studentEmail = user.email || "";
      const studentName = user.fullName || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Student";
      const studentIdNumber = user.studentIdNumber || user.idNumber || user._id || "N/A";

      const payload = {
        studentEmail,
        studentName,
        studentIdNumber,
        categoryKey: ticketCategory,
        priority: ticketPriority,
        subject: ticketSubject.trim(),
        description: ticketDesc.trim(),
      };

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showAlert("Support ticket submitted successfully!", "success");
        setIsModalOpen(false);
        setTicketCategory("");
        setTicketPriority("Normal");
        setTicketSubject("");
        setTicketDesc("");
      } else {
        const errData = await res.json();
        showAlert(errData.message || "Failed to submit support ticket.", "error");
      }
    } catch (err) {
      console.error("❌ Ticket submission network error:", err);
      showAlert("Network error while submitting ticket.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid px-0 py-3 position-relative student-help-page">
      <div className="student-help-shell">
        
        {/* AuthAlert Integration */}
        <div className="mb-3">
          <AuthAlert 
            message={alertMessage} 
            type={alertType} 
            visible={alertVisible} 
            loading={submitting} 
          />
        </div>

        {/* Search Bar Header */}
        <div className="mb-4">
          <div className="input-group shadow-sm border rounded-3 bg-white" style={{ maxWidth: "100%", height: "50px" }}>
            <span className="input-group-text bg-white border-0 ps-3">
              <Search size={18} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-0 shadow-none ps-2"
              placeholder="Search a problem, e.g. 'download', 'password', 'absent'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: "0.95rem" }}
            />
          </div>
        </div>

        {/* Categories & Topics Grid */}
        <div className="d-flex flex-column gap-4 mb-5">
          {filteredCategories.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <div key={cat.key} className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="p-1 rounded bg-light text-primary d-flex align-items-center justify-content-center">
                    <CatIcon size={18} />
                  </div>
                  <h5 className="fw-bold text-dark mb-0">{cat.title}</h5>
                  <span className="badge rounded-pill bg-light text-secondary border px-2 py-1 fw-normal" style={{ fontSize: "0.75rem" }}>
                    {cat.topics.length} topics
                  </span>
                </div>

                <div className="row g-3">
                  {cat.topics.map((topic) => (
                    <div key={topic.id} className="col-12 col-md-6">
                      <div
                        className="card border shadow-sm h-100 p-3 topic-card"
                        style={{ cursor: "pointer", borderRadius: "10px", transition: "all 0.2s ease" }}
                        onClick={() => setSelectedTopic(topic)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#0d6efd";
                          e.currentTarget.style.boxShadow = "0 .25rem .5rem rgba(0,0,0,.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#dee2e6";
                          e.currentTarget.style.boxShadow = "0 .125rem .25rem rgba(0,0,0,.075)";
                        }}
                      >
                        <div className="card-body p-0 d-flex align-items-center justify-content-between gap-3">
                          <div>
                            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: "0.95rem" }}>
                              {topic.title}
                            </h6>
                            <p className="text-muted small mb-0" style={{ fontSize: "0.85rem" }}>
                              {topic.description}
                            </p>
                          </div>
                          <ChevronRight size={18} className="text-muted flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted mb-0">No help topics found matching "{searchQuery}".</p>
            </div>
          )}
        </div>

        {/* Footer Banner */}
        <div className="card border shadow-sm p-4 bg-white mb-4" style={{ borderRadius: "12px" }}>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <h5 className="fw-bold text-dark mb-1">Can't find your answer?</h5>
              <p className="text-muted mb-0 small">Send us the details and our team will get back to you.</p>
            </div>
            <button
              type="button"
              className="btn text-white px-4 py-2 d-inline-flex align-items-center justify-content-center gap-2"
              style={{ backgroundColor: "#0b4d6b", borderRadius: "8px", fontWeight: 500 }}
              onClick={() => setIsModalOpen(true)}
            >
              <LifeBuoy size={16} /> Submit a Ticket
            </button>
          </div>
        </div>

        {/* SUBMIT SUPPORT TICKET MODAL */}
        {isModalOpen && (
          <div 
            className="modal show d-block" 
            tabIndex={-1} 
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(2px)" }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
                
                <div className="modal-header border-bottom px-4 py-3 align-items-center">
                  <div>
                    <h5 className="fw-bold text-dark mb-1">Submit Support Ticket</h5>
                    <p className="text-muted small mb-0">Describe your issue and our team will assist you</p>
                  </div>
                  <button
                    type="button"
                    className="btn-close shadow-none"
                    onClick={() => setIsModalOpen(false)}
                  />
                </div>

                <form onSubmit={handleSubmitTicket}>
                  <div className="modal-body p-4">
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small">Category <span className="text-danger">*</span></label>
                        <select
                          className="form-select shadow-none"
                          required
                          value={ticketCategory}
                          onChange={(e) => setTicketCategory(e.target.value)}
                        >
                          <option value="" disabled>Select</option>
                          {categories.map((cat) => (
                            <option key={cat.key} value={cat.key}>{cat.title}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small">Priority</label>
                        <select
                          className="form-select shadow-none"
                          value={ticketPriority}
                          onChange={(e) => setTicketPriority(e.target.value)}
                        >
                          <option value="Low">Low</option>
                          <option value="Normal">Normal</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Subject <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control shadow-none"
                        placeholder="Brief summary of the issue"
                        required
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label fw-semibold small">Description <span className="text-danger">*</span></label>
                      <textarea
                        className="form-control shadow-none"
                        rows={5}
                        maxLength={1000}
                        placeholder="Describe your issue in detail..."
                        required
                        value={ticketDesc}
                        onChange={(e) => setTicketDesc(e.target.value)}
                      />
                      <div className="d-flex justify-content-end mt-1">
                        <small className="text-muted">{ticketDesc.length}/1000</small>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-top px-4 py-3 bg-light" style={{ borderBottomLeftRadius: "16px", borderBottomRightRadius: "16px" }}>
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4 py-2"
                      style={{ borderRadius: "8px" }}
                      onClick={() => setIsModalOpen(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn text-white px-4 py-2 d-inline-flex align-items-center gap-2"
                      style={{ backgroundColor: "#0b4d6b", borderRadius: "8px" }}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={16} /> Submit Ticket
                        </>
                      )}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        )}

        {/* TOPIC DETAIL PREVIEW MODAL */}
        {selectedTopic && (
          <div 
            className="modal show d-block" 
            tabIndex={-1} 
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(2px)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
                <div className="modal-header border-bottom px-4 py-3">
                  <h5 className="fw-bold text-dark mb-0">{selectedTopic.title}</h5>
                  <button
                    type="button"
                    className="btn-close shadow-none"
                    onClick={() => setSelectedTopic(null)}
                  />
                </div>
                <div className="modal-body p-4">
                  <p className="text-muted mb-3"><strong>Overview:</strong> {selectedTopic.description}</p>
                  <p className="text-dark small mb-0">
                    Detailed troubleshooting steps and documentation guide for this specific issue will appear here. If you need immediate assistance regarding this topic, please use the ticket submission form.
                  </p>
                </div>
                <div className="modal-footer border-top px-4 py-3 bg-light" style={{ borderBottomLeftRadius: "16px", borderBottomRightRadius: "16px" }}>
                  <button
                    type="button"
                    className="btn btn-primary px-4 py-2"
                    style={{ borderRadius: "8px" }}
                    onClick={() => {
                      setSelectedTopic(null);
                      setIsModalOpen(true);
                    }}
                  >
                    Create Ticket for this Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}