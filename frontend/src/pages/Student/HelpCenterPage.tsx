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
  Send,
  HelpCircle,
  X,
} from "lucide-react";
import AuthAlert from "../../components/Authentication/AuthAlert";
import { API_BASE_URL } from "../../config"; // 🟢 Centralized API Configuration

export type HelpTopic = {
  id: string;
  title: string;
  description: string;
  content: {
    overview: string;
    steps: string[];
    note?: string;
  };
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
  const [ticketPriority, setTicketPriority] = useState(""); // Starts empty
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
          {
            id: "a1",
            title: "I can't find an announcement",
            description: "Where announcements live and how to search them",
            content: {
              overview:
                "Announcements are broadcasted by your instructors and administration to keep you updated on important schedule shifts, school events, and class reminders.",
              steps: [
                "Navigate to the main Dashboard or click on the 'Announcements' tab in the sidebar.",
                "Use the category filter buttons at the top of the announcement feed (e.g., General, Academics, Events) to narrow down broadcasts.",
                "Type keywords related to the announcement into the search bar at the top of the page.",
                "Check your archived or older notifications if the post was made more than 30 days ago.",
              ],
              note: "If an announcement was deleted by the author, it will no longer be visible in your feed.",
            },
          },
          {
            id: "a2",
            title: "How to pin or unpin an announcement",
            description: "Keep important announcements at the top of your list",
            content: {
              overview:
                "Pinning allows students and instructors to anchor critical updates to the very top of their announcement feed for quick access.",
              steps: [
                "Locate the announcement card you wish to prioritize in your feed.",
                "Click on the three-dot menu icon in the upper-right corner of the announcement card.",
                "Select 'Pin Announcement' from the dropdown menu. The card will instantly shift to the pinned section at the top.",
                "To unpin, click the menu again and select 'Unpin Announcement'.",
              ],
            },
          },
          {
            id: "a3",
            title: "Announcement text looks cut off",
            description: "How to read the full message",
            content: {
              overview:
                "Long announcements are automatically collapsed in the main feed to keep the interface clean and easy to navigate.",
              steps: [
                "Scan the bottom edge of the announcement card for a 'Read More' or 'Expand' button.",
                "Click anywhere on the truncated text or the button to open the full announcement view.",
                "Close the expanded view by clicking outside the card or selecting the 'Show Less' button.",
              ],
            },
          },
        ],
      },
      {
        key: "courses",
        title: "Courses & Materials",
        icon: BookOpen,
        topics: [
          {
            id: "c1",
            title: "My teacher's material is not showing",
            description: "Why an upload may not appear under your course",
            content: {
              overview:
                "If an instructor uploads lecture notes, slides, or assignments, they usually appear immediately under your enrolled course page. Delays or missing files are typically permission or caching related.",
              steps: [
                "Refresh your browser page (or press Ctrl+F5 / Cmd+Shift+R) to clear stale cache data.",
                "Verify that you are viewing the correct semester and section under 'My Courses'.",
                "Check with your instructor to confirm whether the material has been officially published or is still in draft mode.",
              ],
              note: "Draft materials are only visible to instructors until officially published to the student portal.",
            },
          },
          {
            id: "c2",
            title: "Download is not working",
            description: "What to do when a file won't download",
            content: {
              overview:
                "File download errors can occur due to strict browser popup blockers, expired secure tokens, or interrupted network connections.",
              steps: [
                "Check your browser's address bar for blocked download or popup indicators and allow downloads from the portal.",
                "Try opening the file in a new browser tab rather than direct download.",
                "Switch to a modern browser like Google Chrome, Mozilla Firefox, or Microsoft Edge if you are using an outdated client.",
                "Clear your browser cookies and site data for the portal domain and log back in.",
              ],
            },
          },
          {
            id: "c3",
            title: "A subject is missing from My Courses",
            description: "Why a subject may not be listed",
            content: {
              overview:
                "Enrolled subjects are synchronized automatically with the registrar's official enrollment database. A missing subject usually points to registration processing status.",
              steps: [
                "Review your official enrollment assessment form (EAF) to confirm the subject code is officially listed.",
                "Check if add/drop or shifting adjustments are still being finalized by the Registrar's Office.",
                "Submit a support ticket attaching your valid EAF so our technical team can manually map the course to your account.",
              ],
            },
          },
        ],
      },
      {
        key: "attendance",
        title: "Attendance",
        icon: Calendar,
        topics: [
          {
            id: "at1",
            title: "How to excuse an absence",
            description: "Submit a request for an absence to be excused",
            content: {
              overview:
                "Students can formally submit excuse letters and valid documentation (such as medical certificates or official letters) through the portal for instructor review.",
              steps: [
                "Go to your Attendance tracker tab under your student dashboard.",
                "Locate the specific date and subject where you were marked absent.",
                "Click on the 'Request Excuse' button next to the attendance log.",
                "Fill out the reason, attach a scanned copy or clear photo of your medical certificate/supporting document, and click Submit.",
              ],
              note: "Excuse requests must typically be submitted within 3 school days following your return.",
            },
          },
          {
            id: "at2",
            title: "My attendance record looks wrong",
            description: "What to do when a mark doesn't match reality",
            content: {
              overview:
                "Attendance logs are recorded by instructors during class sessions. Discrepancies can happen due to system synchronization delays or manual entry errors.",
              steps: [
                "Take note of the exact date, time, and subject code with the incorrect record.",
                "Reach out directly to your subject instructor during consultation hours to verify your presence.",
                "If the instructor confirms the correction, they can update the register from their faculty dashboard.",
              ],
            },
          },
          {
            id: "at3",
            title: "I was marked late but I wasn't",
            description: "Fixing a wrong 'Late' mark",
            content: {
              overview:
                "Late marks are often triggered automatically if attendance scanning or manual roll-call occurs after the class start threshold.",
              steps: [
                "Verify the exact timestamp you logged into the classroom or virtual session.",
                "Contact your instructor politely before or after class to review the attendance timestamp log.",
                "Ask the instructor to adjust your status from 'Late' to 'Present' if verified.",
              ],
            },
          },
        ],
      },
      {
        key: "account",
        title: "Account & Profile",
        icon: User,
        topics: [
          {
            id: "ac1",
            title: "I forgot my password",
            description: "Reset your password with an email code",
            content: {
              overview:
                "You can securely reset your student portal password using the self-service verification system tied to your school email.",
              steps: [
                "Click on the 'Forgot Password?' link on the login screen.",
                "Enter your registered student email address and click 'Send Verification Code'.",
                "Check your inbox (and spam/junk folder) for the 6-digit verification code.",
                "Enter the code on the portal screen, type your new secure password, and confirm the reset.",
              ],
            },
          },
          {
            id: "ac2",
            title: "How to update my profile",
            description: "Change your profile details",
            content: {
              overview:
                "Certain personal details can be updated directly from your settings, while official records require registrar verification.",
              steps: [
                "Click on your profile avatar in the upper right navigation bar and select 'Account Settings'.",
                "Navigate to the 'Personal Information' section.",
                "Edit editable fields such as your contact number, preferred name display, or profile picture.",
                "Click 'Save Changes' to update your profile instantly.",
              ],
              note: "Official name changes, birthdates, and student ID numbers cannot be edited directly and require a formal request to the Registrar.",
            },
          },
          {
            id: "ac3",
            title: "My account is locked or inactive",
            description: "When you can't log in at all",
            content: {
              overview:
                "Accounts may be temporarily locked after multiple consecutive failed login attempts or marked inactive due to semester enrollment status.",
              steps: [
                "Wait 15 minutes for the security lockout timer to automatically expire before attempting to log in again.",
                "Use the 'Forgot Password' flow if you suspect your credentials are out of date.",
                "If your account remains locked or inactive, submit a support ticket providing your full name and student ID number for IT assistance.",
              ],
            },
          },
        ],
      },
    ],
    [],
  );

  // Filter topics based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        topics: cat.topics.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.content.overview.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.topics.length > 0);
  }, [searchQuery, categories]);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCategory || !ticketSubject.trim() || !ticketDesc.trim()) return;

    setSubmitting(true);

    try {
      const userStr =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!userStr) {
        showAlert("Session expired. Please sign in again.", "error");
        setSubmitting(false);
        return;
      }

      const user = JSON.parse(userStr);

      const email = user.email || "";
      const name =
        user.fullName ||
        user.name ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        "Student";
      const idNumber =
        user.studentIdNumber || user.idNumber || user._id || "N/A";

      // Updated payload matching model properties: email, name, idNumber
      const payload = {
        email,
        name,
        idNumber,
        categoryKey: ticketCategory,
        priority: ticketPriority || "Normal",
        subject: ticketSubject.trim(),
        description: ticketDesc.trim(),
      };

      // 🟢 Uses API_BASE_URL config
      const res = await fetch(`${API_BASE_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showAlert("Support ticket submitted successfully!", "success");
        setIsModalOpen(false);
        setTicketCategory("");
        setTicketPriority("");
        setTicketSubject("");
        setTicketDesc("");
      } else {
        const errData = await res.json();
        showAlert(
          errData.message || "Failed to submit support ticket.",
          "error",
        );
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
        {/* Page Header with Top-Right Submit Ticket Button */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <HelpCircle className="text-primary" size={26} />
              <h2 className="fw-bold text-dark mb-0">Help Center</h2>
            </div>
            <p className="text-muted mb-0 small">
              Student guides, FAQs, updates, and student portal support
            </p>
          </div>
          <button
            type="button"
            className="btn text-white px-4 py-2 d-inline-flex align-items-center justify-content-center gap-2 shadow-sm align-self-start align-self-md-auto"
            style={{
              backgroundColor: "#0b4d6b",
              borderRadius: "8px",
              fontWeight: 500,
            }}
            onClick={() => setIsModalOpen(true)}
          >
            <LifeBuoy size={16} /> Submit a Ticket
          </button>
        </div>

        {/* AuthAlert Integration */}
        <div className="mb-3">
          <AuthAlert
            message={alertMessage}
            type={alertType}
            visible={alertVisible}
            loading={false}
          />
        </div>

        {/* Search Bar Header */}
        <div className="mb-4">
          <div
            className="input-group shadow-sm border rounded-3 bg-white"
            style={{ maxWidth: "100%", height: "50px" }}
          >
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
                  <span
                    className="badge rounded-pill bg-light text-secondary border px-2 py-1 fw-normal"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {cat.topics.length} topics
                  </span>
                </div>

                <div className="row g-3">
                  {cat.topics.map((topic) => (
                    <div key={topic.id} className="col-12 col-md-6">
                      <div
                        className="card border shadow-sm h-100 p-3 topic-card"
                        style={{
                          cursor: "pointer",
                          borderRadius: "10px",
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => setSelectedTopic(topic)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#0d6efd";
                          e.currentTarget.style.boxShadow =
                            "0 .25rem .5rem rgba(0,0,0,.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#dee2e6";
                          e.currentTarget.style.boxShadow =
                            "0 .125rem .25rem rgba(0,0,0,.075)";
                        }}
                      >
                        <div className="card-body p-0 d-flex align-items-center justify-content-between gap-3">
                          <div>
                            <h6
                              className="fw-bold text-dark mb-1"
                              style={{ fontSize: "0.95rem" }}
                            >
                              {topic.title}
                            </h6>
                            <p
                              className="text-muted small mb-0"
                              style={{ fontSize: "0.85rem" }}
                            >
                              {topic.description}
                            </p>
                          </div>
                          <ChevronRight
                            size={18}
                            className="text-muted flex-shrink-0"
                          />
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
              <p className="text-muted mb-0">
                No help topics found matching "{searchQuery}".
              </p>
            </div>
          )}
        </div>

        {/* SUBMIT SUPPORT TICKET MODAL */}
        {isModalOpen && (
          <div
            className="modal show d-block"
            tabIndex={-1}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(2px)",
              zIndex: 1055,
              pointerEvents: "auto",
            }}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              style={{ maxWidth: "600px", pointerEvents: "auto" }}
            >
              <div
                className="card border-0 shadow-lg p-4 position-relative bg-white w-100"
                style={{
                  borderRadius: "16px",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  pointerEvents: "auto",
                }}
              >
                {/* Close Button */}
                <button
                  type="button"
                  className="btn btn-sm p-1 position-absolute top-0 end-0 m-3 text-muted border-0 bg-transparent shadow-none"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  aria-label="Close"
                  style={{ zIndex: 10, cursor: "pointer" }}
                >
                  <X size={20} />
                </button>

                <div className="mb-3">
                  <h4
                    className="fw-bold text-dark mb-1"
                    style={{ fontSize: "1.25rem" }}
                  >
                    Submit Support Ticket
                  </h4>
                  <p className="text-muted small mb-0">
                    Describe your issue and our team will assist you
                  </p>
                </div>

                <form onSubmit={handleSubmitTicket}>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small text-dark">
                        Category *
                      </label>
                      <select
                        className="form-select shadow-none py-2"
                        required
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        style={{
                          borderRadius: "8px",
                          borderColor: "#ced4da",
                          cursor: "pointer",
                        }}
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        {categories.map((cat) => (
                          <option key={cat.key} value={cat.key}>
                            {cat.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small text-dark">
                        Priority
                      </label>
                      <select
                        className="form-select shadow-none py-2"
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value)}
                        style={{
                          borderRadius: "8px",
                          borderColor: "#ced4da",
                          cursor: "pointer",
                        }}
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-dark">
                      Subject *
                    </label>
                    <input
                      type="text"
                      className="form-control shadow-none py-2"
                      placeholder="Brief summary of the issue"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      style={{ borderRadius: "8px", borderColor: "#ced4da" }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-dark">
                      Description *
                    </label>
                    <textarea
                      className="form-control shadow-none"
                      rows={4}
                      maxLength={1000}
                      placeholder="Describe your issue in detail..."
                      required
                      value={ticketDesc}
                      onChange={(e) => setTicketDesc(e.target.value)}
                      style={{ borderRadius: "8px", borderColor: "#ced4da" }}
                    />
                    <div className="d-flex justify-content-end mt-1">
                      <small className="text-muted">
                        {ticketDesc.length}/1000
                      </small>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-end gap-2 pt-2">
                    <button
                      type="button"
                      className="btn btn-light px-4 py-2 border"
                      style={{ borderRadius: "8px", fontWeight: 500 }}
                      onClick={() => setIsModalOpen(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn text-white px-4 py-2 d-inline-flex align-items-center gap-2"
                      style={{
                        backgroundColor: "#0b4d6b",
                        borderRadius: "8px",
                        fontWeight: 500,
                      }}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Submit Ticket</span>
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
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(2px)",
              zIndex: 1055,
              pointerEvents: "auto",
            }}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
              style={{ maxWidth: "650px", pointerEvents: "auto" }}
            >
              <div
                className="card border-0 shadow-lg bg-white p-0 w-100"
                style={{
                  borderRadius: "16px",
                  maxHeight: "85vh",
                  pointerEvents: "auto",
                }}
              >
                <div className="modal-header border-bottom px-4 py-3">
                  <h5 className="fw-bold text-dark mb-0">
                    {selectedTopic.title}
                  </h5>
                  <button
                    type="button"
                    className="btn-close shadow-none"
                    onClick={() => setSelectedTopic(null)}
                  />
                </div>
                <div className="modal-body p-4">
                  <p className="text-muted mb-3">
                    <strong>Overview:</strong> {selectedTopic.content.overview}
                  </p>

                  <h6 className="fw-bold text-dark mb-2">Step-by-Step Guide:</h6>
                  <ol className="ps-3 mb-3 text-dark small">
                    {selectedTopic.content.steps.map((step, idx) => (
                      <li key={idx} className="mb-2">
                        {step}
                      </li>
                    ))}
                  </ol>

                  {selectedTopic.content.note && (
                    <div
                      className="alert alert-warning py-2 px-3 small mb-0"
                      style={{ borderRadius: "8px" }}
                    >
                      <strong>Note:</strong> {selectedTopic.content.note}
                    </div>
                  )}
                </div>
                <div
                  className="modal-footer border-top px-4 py-3 bg-light"
                  style={{
                    borderBottomLeftRadius: "16px",
                    borderBottomRightRadius: "16px",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-light px-3 py-2 border text-dark"
                    style={{ borderRadius: "8px" }}
                    onClick={() => setSelectedTopic(null)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn text-white px-4 py-2"
                    style={{ backgroundColor: "#0b4d6b", borderRadius: "8px" }}
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