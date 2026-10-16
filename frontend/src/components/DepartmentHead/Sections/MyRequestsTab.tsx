// ✅ src/components/DepartmentHead/Sections/MyRequestsTab.tsx

import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import { API_BASE_URL } from "../../../config";

export interface SectionRequest {
  id: string;
  sectionName: string;
  program: string;
  year: number;
  capacity: number;
  preferredRoom: string;
  status: "Pending" | "Approved" | "Rejected";
  feedback: string;
}

interface MyRequestsTabProps {
  requests?: SectionRequest[];
  onRequestDeleted?: (deletedId: string) => void;
}

export default function MyRequestsTab({ requests: externalRequests, onRequestDeleted }: MyRequestsTabProps) {
  const [internalRequests, setInternalRequests] = useState<SectionRequest[]>(externalRequests || []);
  const [loading, setLoading] = useState<boolean>(!externalRequests);
  const [error, setError] = useState<string | null>(null);
  
  // 🔍 State for status filter dropdown
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // 🖱️ Hover state for Refresh button
  const [isHoveredRefresh, setIsHoveredRefresh] = useState(false);

  // 🗑️ Delete Confirmation Modal State
  const [requestToDelete, setRequestToDelete] = useState<SectionRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Keep internal requests synced if external requests prop updates
  useEffect(() => {
    if (externalRequests) {
      setInternalRequests(externalRequests);
      setLoading(false);
    }
  }, [externalRequests]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      let userDepartment = "";
      try {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          userDepartment = parsed.department || "";
        }
      } catch (e) {
        console.error("Error reading user session", e);
      }

      const url = userDepartment
        ? `${API_BASE_URL}/section-requests?department=${encodeURIComponent(userDepartment)}`
        : `${API_BASE_URL}/section-requests`;

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        const mapped: SectionRequest[] = data.map((r: any) => ({
          id: r.id || r._id,
          sectionName: r.sectionName,
          program: r.program,
          year: Number(r.yearLevel) || r.year || 1,
          capacity: r.requestedCapacity || r.capacity || 40,
          preferredRoom: r.preferredRoom || "—",
          status: r.status || "Pending",
          feedback: r.feedback || (r.status === "Pending" ? "Awaiting Registrar review" : "Reviewed by Registrar"),
        }));
        setInternalRequests(mapped);
      } else {
        setError(data.message || "Failed to load section requests.");
      }
    } catch (err) {
      console.error("Failed to fetch section requests:", err);
      setError("Network error while loading requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!externalRequests) {
      fetchRequests();
    }
  }, [externalRequests]);

  // 🗑️ Handle Confirmed Deletion with detailed error catching
  const confirmDelete = async () => {
    if (!requestToDelete) return;

    const deleteUrl = `${API_BASE_URL}/section-requests/${requestToDelete.id}`;
    console.log("Attempting to delete request at URL:", deleteUrl);

    try {
      setIsDeleting(true);
      const res = await fetch(deleteUrl, {
        method: "DELETE",
      });

      let data = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        // Response might not be JSON (e.g. 404 HTML page)
      }

      if (res.ok) {
        setInternalRequests((prev) => prev.filter((req) => req.id !== requestToDelete.id));
        if (onRequestDeleted) {
          onRequestDeleted(requestToDelete.id);
        }
        setRequestToDelete(null);
      } else {
        alert((data as any).message || `Failed to delete section request. Status: ${res.status}`);
      }
    } catch (err) {
      console.error("Failed to delete request network exception:", err);
      alert("Network error while deleting request. Please check your backend server connection.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-success text-white";
      case "Rejected":
        return "bg-danger text-white";
      default:
        return "bg-warning text-white";
    }
  };

  // 🔍 Filtered requests based on selected dropdown status
  const filteredRequests = internalRequests.filter((req) => {
    if (statusFilter === "All") return true;
    return req.status === statusFilter;
  });

  return (
    <div className="card border-0 shadow-sm p-4" style={{ width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Submitted Section Requests</h5>
        <button 
          type="button"
          className="btn btn-sm d-flex align-items-center gap-1 text-nowrap py-1 px-3 shadow-sm"
          style={{
            fontSize: "12px",
            backgroundColor: isHoveredRefresh ? "#0d5173" : "#ffffff",
            color: isHoveredRefresh ? "#ffffff" : "#0d5173",
            borderColor: "#0d5173",
            borderWidth: "1px",
            borderStyle: "solid",
            opacity: loading ? 0.65 : 1,
            transition: "all 0.2s ease-in-out",
          }}
          onMouseEnter={() => setIsHoveredRefresh(true)}
          onMouseLeave={() => setIsHoveredRefresh(false)}
          onClick={fetchRequests}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? "fa-spin" : ""} /> Refresh
        </button>
      </div>

      {/* 🔍 Filter Dropdown Toolbar */}
      <div className="d-flex align-items-center gap-2 mb-3" style={{ maxWidth: "300px" }}>
        <label htmlFor="statusFilterSelect" className="text-muted small fw-semibold text-nowrap mb-0">
          Filter Status:
        </label>
        <select
          id="statusFilterSelect"
          className="form-select form-select-sm shadow-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: "13px" }}>
          <AlertCircle size={16} className="flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      <div className="table-responsive" style={{ width: "100%", maxWidth: "100%", minWidth: 0, overflowX: "auto" }}>
        <table className="table align-middle mb-0" style={{ width: "100%", minWidth: "650px" }}>
          <thead className="table-light text-muted small">
            <tr>
              <th>Section</th>
              <th>Capacity</th>
              <th>Preferred Room</th>
              <th>Status</th>
              <th>Registrar Feedback</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted">
                  Loading section requests...
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted">
                  {internalRequests.length === 0 
                    ? "No section requests submitted yet." 
                    : `No ${statusFilter.toLowerCase()} section requests found.`}
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div className="fw-semibold">{req.sectionName}</div>
                    <small className="text-muted">
                      {req.program} · Year {req.year}
                    </small>
                  </td>
                  <td>{req.capacity}</td>
                  <td>
                    <span className="text-secondary">{req.preferredRoom || "—"}</span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="text-muted small">{req.feedback}</td>
                  <td className="text-end">
                    {/* 🚫 Pending requests cannot be deleted */}
                    {req.status !== "Pending" ? (
                      <button
                        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                        style={{ fontSize: "12px" }}
                        onClick={() => setRequestToDelete(req)}
                        title="Delete Request"
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : (
                      <span className="text-muted small fst-italic" style={{ fontSize: "12px" }}>
                        Cannot delete pending
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🛑 Centered Responsive Delete Confirmation Modal */}
      {requestToDelete && (
        <div 
          className="modal fade show d-block" 
          tabIndex={-1} 
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}
          onClick={() => !isDeleting && setRequestToDelete(null)}
        >
          <div 
            className="modal-dialog modal-dialog-centered modal-dialog-scrollable px-3" 
            style={{ maxWidth: "450px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-danger d-flex align-items-center gap-2">
                  <AlertCircle size={20} /> Delete Request
                </h5>
                <button 
                  type="button" 
                  className="btn-close shadow-none" 
                  onClick={() => !isDeleting && setRequestToDelete(null)}
                  disabled={isDeleting}
                ></button>
              </div>
              <div className="modal-body py-3">
                <p className="text-muted mb-2">
                  Are you sure you want to delete the request for section{" "}
                  <strong className="text-dark">{requestToDelete.sectionName}</strong>?
                </p>
                <div className="alert alert-warning py-2 small mb-0">
                  This action is permanent and cannot be undone.
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary btn-sm px-3" 
                  onClick={() => setRequestToDelete(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger btn-sm px-3 d-flex align-items-center gap-1" 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Deleting...
                    </>
                  ) : (
                    "Confirm Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}