// ✅ src/pages/SuperAdmin/SuperAdminConcerns.tsx

import { useState, useEffect } from "react";
import {
  Search,
  MessageSquare,
  Send,
  Archive,
  Inbox,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import AuthAlert from "../../components/Authentication/AuthAlert";

interface Ticket {
  _id: string;
  studentEmail: string;
  studentName: string;
  studentIdNumber: string;
  categoryKey: string;
  priority: "Low" | "Normal" | "High" | "Urgent";
  subject: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved";
  createdAt: string;
}

export default function SuperAdminConcerns() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [studentMap, setStudentMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Tab view state: "active" for Open / In Progress, "archive" for Resolved
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active");

  // Selected Ticket for Detail View / Reply Modal
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Confirmation Modal State for Deletion
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);

  // Reply Form States
  const [replyMessage, setReplyMessage] = useState("");
  const [newStatus, setNewStatus] = useState<
    "Open" | "In Progress" | "Resolved"
  >("Resolved");
  const [sending, setSending] = useState(false);

  // AuthAlert States
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, studentsRes] = await Promise.all([
        fetch("/api/tickets"),
        fetch("/api/students"),
      ]);

      if (ticketsRes.ok) {
        const ticketData = await ticketsRes.json();
        setTickets(ticketData);
      }

      if (studentsRes.ok) {
        const studentData = await studentsRes.json();
        const map = new Map<string, string>();
        studentData.forEach((s: any) => {
          if (s.email) {
            map.set(s.email.toLowerCase(), s.id || s.studentIdNumber);
          }
        });
        setStudentMap(map);
      }
    } catch (err) {
      console.error("Failed to fetch concerns data:", err);
      showAlert("Failed to load student concerns.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSending(true);

    try {
      const res = await fetch(`/api/tickets/${selectedTicket._id}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyMessage, status: newStatus }),
      });

      if (res.ok) {
        showAlert("Reply email sent successfully to the student!", "success");
        setSelectedTicket(null);
        setReplyMessage("");
        fetchData();
      } else {
        const errData = await res.json();
        showAlert(errData.message || "Failed to send reply.", "error");
      }
    } catch (err) {
      console.error("Network error sending reply:", err);
      showAlert("Network error while sending reply.", "error");
    } finally {
      setSending(false);
    }
  };

  const confirmDeleteTicket = async () => {
    if (!ticketToDelete) return;

    try {
      setSending(true);
      const res = await fetch(`/api/tickets/${ticketToDelete._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showAlert("Resolved ticket deleted successfully.", "success");
        setTicketToDelete(null);
        setSelectedTicket(null);
        fetchData();
      } else {
        const errData = await res.json();
        showAlert(errData.message || "Failed to delete ticket.", "error");
      }
    } catch (err) {
      console.error("Network error deleting ticket:", err);
      showAlert("Network error while deleting ticket.", "error");
    } finally {
      setSending(false);
    }
  };

  // Filter based on Tab and Search Query
  const filteredTickets = tickets.filter((t) => {
    const isResolved = t.status === "Resolved";
    if (activeTab === "active" && isResolved) return false;
    if (activeTab === "archive" && !isResolved) return false;

    const readableId =
      studentMap.get(t.studentEmail?.toLowerCase()) || t.studentIdNumber || "";
    const q = searchQuery.toLowerCase();
    return (
      t.studentName.toLowerCase().includes(q) ||
      t.studentEmail.toLowerCase().includes(q) ||
      readableId.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q)
    );
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-danger text-white";
      case "High":
        return "bg-warning text-dark";
      case "Normal":
        return "bg-info text-dark";
      default:
        return "bg-secondary text-white";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-success text-white";
      case "In Progress":
        return "bg-primary text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  const activeCount = tickets.filter((t) => t.status !== "Resolved").length;
  const archiveCount = tickets.filter((t) => t.status === "Resolved").length;

  return (
    <div className="container-fluid p-0" style={{ marginTop: "-15px" }}>
      {/* AuthAlert Integration */}
      <div className="mb-3">
        <AuthAlert
          message={alertMessage}
          type={alertType}
          visible={alertVisible}
          loading={sending}
        />
      </div>

      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            Student Concerns & Support Tickets
          </h2>
          <p className="text-muted mb-0">
            Review student inquiries and respond directly via email
          </p>
        </div>

        <div className="input-group shadow-sm" style={{ maxWidth: "300px" }}>
          <span className="input-group-text bg-white border-end-0">
            <Search size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0 shadow-none"
            placeholder="Search student or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Navigation Tabs for Active vs Archive */}
      <ul className="nav nav-pills mb-3 gap-2">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold ${activeTab === "active" ? "active bg-primary text-white" : "bg-white text-dark border"}`}
            onClick={() => setActiveTab("active")}
            style={{ borderRadius: "8px" }}
          >
            <Inbox size={16} /> Active Tickets
            <span
              className={`badge rounded-pill ${activeTab === "active" ? "bg-light text-primary" : "bg-secondary text-white"}`}
            >
              {activeCount}
            </span>
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold ${activeTab === "archive" ? "active bg-primary text-white" : "bg-white text-dark border"}`}
            onClick={() => setActiveTab("archive")}
            style={{ borderRadius: "8px" }}
          >
            <Archive size={16} /> Resolved Archive
            <span
              className={`badge rounded-pill ${activeTab === "archive" ? "bg-light text-primary" : "bg-secondary text-white"}`}
            >
              {archiveCount}
            </span>
          </button>
        </li>
      </ul>

      {/* Card container with vertical padding but px-0 to keep table aligned flush */}
      <div
        className="card border-0 shadow-sm py-4 px-0 mb-4"
        style={{ borderRadius: "12px" }}
      >
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-uppercase fs-7">
              <tr>
                <th className="ps-4">Student Name & ID</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date Submitted</th>
                <th className="text-end pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => {
                const readableStudentId =
                  studentMap.get(t.studentEmail?.toLowerCase()) ||
                  t.studentIdNumber ||
                  "N/A";

                return (
                  <tr
                    key={t._id}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSelectedTicket(t);
                      setNewStatus(
                        t.status === "Open" ? "In Progress" : t.status,
                      );
                    }}
                  >
                    <td className="ps-4">
                      <div className="fw-semibold text-dark">
                        {t.studentName}
                      </div>
                      <div className="text-muted small">
                        <span className="fw-medium text-primary">
                          {readableStudentId}
                        </span>{" "}
                        &bull; {t.studentEmail}
                      </div>
                    </td>
                    <td>
                      <div
                        className="text-dark fw-medium text-truncate"
                        style={{ maxWidth: "280px" }}
                      >
                        {t.subject}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getPriorityBadge(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {new Date(t.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(t);
                            setNewStatus(
                              t.status === "Open" ? "In Progress" : t.status,
                            );
                          }}
                        >
                          <MessageSquare size={14} />{" "}
                          {t.status === "Resolved"
                            ? "View Archive"
                            : "View & Reply"}
                        </button>
                        {t.status === "Resolved" && (
                          <button
                            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
                            title="Delete Ticket"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTicketToDelete(t);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted ps-4">
                    {activeTab === "active"
                      ? "No active support tickets found."
                      : "No resolved tickets in the archive."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TICKET DETAIL & REPLY MODAL */}
      {selectedTicket && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(2px)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "16px" }}
            >
              <div className="modal-header border-bottom px-4 py-3 align-items-center">
                <div>
                  <h5 className="fw-bold text-dark mb-1">
                    {selectedTicket.status === "Resolved"
                      ? "Resolved Ticket Details (Archived)"
                      : "Ticket Details & Response"}
                  </h5>
                  <p className="text-muted small mb-0">
                    Submitted by: <strong>{selectedTicket.studentName}</strong>{" "}
                    (
                    {studentMap.get(
                      selectedTicket.studentEmail?.toLowerCase(),
                    ) ||
                      selectedTicket.studentIdNumber ||
                      "N/A"}
                    )
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setSelectedTicket(null)}
                />
              </div>

              <form onSubmit={handleSendReply}>
                <div className="modal-body p-4">
                  <div
                    className="card border bg-light p-3 mb-4"
                    style={{ borderRadius: "10px" }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold text-dark mb-0">
                        {selectedTicket.subject}
                      </h6>
                      <div className="d-flex gap-2">
                        <span
                          className={`badge ${getPriorityBadge(selectedTicket.priority)}`}
                        >
                          {selectedTicket.priority} Priority
                        </span>
                        <span
                          className={`badge ${getStatusBadge(selectedTicket.status)}`}
                        >
                          {selectedTicket.status}
                        </span>
                      </div>
                    </div>
                    <hr className="my-2" />
                    <p className="text-muted small mb-1">
                      <strong>Description:</strong>
                    </p>
                    <p
                      className="text-dark mb-0"
                      style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem" }}
                    >
                      {selectedTicket.description}
                    </p>
                    <div className="text-muted text-end small mt-2">
                      Submitted on:{" "}
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {selectedTicket.status === "Resolved" ? (
                    <div
                      className="alert alert-success d-flex align-items-center gap-2 mb-0"
                      role="alert"
                    >
                      <CheckCircle2 size={20} className="flex-shrink-0" />
                      <div>
                        This ticket has been marked as <strong>Resolved</strong>{" "}
                        and moved to the archive. Further email replies are
                        disabled.
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <label className="form-label fw-semibold small">
                          Update Ticket Status
                        </label>
                        <select
                          className="form-select shadow-none"
                          value={newStatus}
                          onChange={(e: any) => setNewStatus(e.target.value)}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>

                      <div className="mb-2">
                        <label className="form-label fw-semibold small">
                          Email Reply Message{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control shadow-none"
                          rows={5}
                          placeholder="Type your response to answer the student's concern here..."
                          required
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div
                  className="modal-footer border-top px-4 py-3 bg-light d-flex justify-content-between"
                  style={{
                    borderBottomLeftRadius: "16px",
                    borderBottomRightRadius: "16px",
                  }}
                >
                  <div>
                    {selectedTicket.status === "Resolved" && (
                      <button
                        type="button"
                        className="btn btn-danger px-3 py-2 d-inline-flex align-items-center gap-2"
                        onClick={() => setTicketToDelete(selectedTicket)}
                        disabled={sending}
                      >
                        <Trash2 size={16} /> Delete Ticket
                      </button>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4 py-2"
                      onClick={() => setSelectedTicket(null)}
                      disabled={sending}
                    >
                      Close
                    </button>
                    {selectedTicket.status !== "Resolved" && (
                      <button
                        type="submit"
                        className="btn text-white px-4 py-2 d-inline-flex align-items-center gap-2"
                        style={{ backgroundColor: "#0b4d6b" }}
                        disabled={sending}
                      >
                        {sending ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          <Send size={16} />
                        )}{" "}
                        Send Email & Update
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR DELETION */}
      {ticketToDelete && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(2px)",
            zIndex: 1060,
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "420px" }}
          >
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "16px" }}
            >
              <div className="modal-body text-center p-4">
                <div className="mb-3 text-danger bg-danger bg-opacity-10 d-inline-flex p-3 rounded-circle">
                  <Trash2 size={28} />
                </div>
                <h5 className="fw-bold text-dark mb-2">
                  Delete Resolved Ticket?
                </h5>
                <p className="text-muted small mb-4">
                  Are you sure you want to permanently delete the ticket
                  regarding <strong>"{ticketToDelete.subject}"</strong>? This
                  action cannot be undone.
                </p>

                <div className="d-flex gap-2 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4 py-2"
                    style={{ borderRadius: "8px" }}
                    onClick={() => setTicketToDelete(null)}
                    disabled={sending}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger px-4 py-2 d-inline-flex align-items-center gap-2"
                    style={{ borderRadius: "8px" }}
                    onClick={confirmDeleteTicket}
                    disabled={sending}
                  >
                    {sending ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      "Yes, Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
