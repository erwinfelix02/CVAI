import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import AnnouncementStats from "../../components/Faculty/Announcements/AnnouncementStats";
import AnnouncementList from "../../components/Faculty/Announcements/AnnouncementList";
import AnnouncementModal from "../../components/Faculty/Announcements/AnnouncementModal";
import type { Announcement } from "../../components/Faculty/Announcements/types";

import "../../styles/faculty-announcements.css";

export default function FacultyAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Custom Delete UI Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get logged-in user details from LocalStorage
  const user = useMemo(() => {
    try {
      const userJson = localStorage.getItem("user");
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }, []);

  // Fetch Announcements from Database
  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const facultyId = user?.id || user?._id || "";
      const department = user?.department || "";

      const queryParams = new URLSearchParams();
      if (facultyId) queryParams.append("facultyId", facultyId);
      if (department) queryParams.append("department", department);

      const res = await fetch(`/api/announcements?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load announcements from server.");
      }

      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("fetchAnnouncements error:", err);
      setError(err.message || "Failed to fetch announcements.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Dynamically extract available courses or fall back to defaults
  const availableCourses = useMemo(() => {
    const unique = Array.from(new Set(items.map((i) => i.course)));
    return unique.length > 0
      ? ["All Courses", ...unique]
      : ["All Courses", "CS 101", "CS 301", "CS 401", "CS 501"];
  }, [items]);

  const handleOpenCreateModal = () => {
    setEditingAnnouncement(null);
    setIsModalOpen(true);
  };

  const handleEditTrigger = (a: Announcement) => {
    setEditingAnnouncement(a);
    setIsModalOpen(true);
  };

  const handleDeleteTrigger = (a: Announcement) => {
    setDeletingId(a.id);
  };

  // Delete Announcement API Request
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/announcements/${deletingId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete announcement from server.");
      }

      // Optimistic state removal
      setItems((prev) => prev.filter((x) => x.id !== deletingId));
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.message || "Error deleting announcement.");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  // Triggered when Save / Edit completes successfully in AnnouncementModal
  const handleSaveSuccess = async () => {
    // Re-fetch all entries from backend to ensure dates & virtual fields match server ground truth
    await fetchAnnouncements();
  };

  return (
    <div className="container-fluid py-3 py-md-4 faculty-announcements-page">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Announcements</h3>
          <p className="text-muted mb-0">
            Create and manage class announcements for{" "}
            {user?.department || "your department"}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-success d-inline-flex align-items-center gap-2 px-3"
          onClick={handleOpenCreateModal}
        >
          <Plus size={18} />
          New Announcement
        </button>
      </div>

      {/* Stats Bar */}
      <AnnouncementStats items={items} />

      {/* Main Content Area */}
      {isLoading ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted my-4">
          <div className="d-flex align-items-center justify-content-center gap-2">
            <Loader2
              className="spinner-border spinner-border-sm text-primary"
              size={22}
            />
            <span className="fw-medium">
              Loading department announcements...
            </span>
          </div>
        </div>
      ) : error ? (
        <div
          className="alert alert-danger d-flex align-items-center gap-2"
          role="alert"
        >
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      ) : (
        <AnnouncementList
          items={items}
          onEdit={handleEditTrigger}
          onDelete={handleDeleteTrigger}
        />
      )}

      {/* Create / Edit Modal */}
      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAnnouncement(null);
        }}
        courses={availableCourses}
        announcementToEdit={editingAnnouncement}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* ==================== CENTERED DELETE CONFIRMATION OVERLAY ==================== */}
      {deletingId && (
        <div
          className="modal-blur-backdrop-fixed d-flex align-items-center justify-content-center p-3"
          onClick={() => {
            if (!isDeleting) setDeletingId(null);
          }}
        >
          <div
            className="bg-white rounded-4 p-4 shadow-lg text-center"
            style={{ maxWidth: 380, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 text-danger mb-3"
              style={{ width: 56, height: 56 }}
            >
              <Trash2 size={28} />
            </div>
            <h5 className="fw-bold text-dark mb-1">Delete Announcement?</h5>
            <p className="text-muted small mb-4">
              Are you sure you want to remove this announcement? Students will
              no longer see it.
            </p>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-light border w-50 py-2 rounded-3 fw-medium text-muted"
                disabled={isDeleting}
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger w-50 py-2 rounded-3 fw-medium d-inline-flex align-items-center justify-content-center gap-2"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
              >
                {isDeleting ? (
                  <>
                    <Loader2
                      size={16}
                      className="spinner-border spinner-border-sm"
                    />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
