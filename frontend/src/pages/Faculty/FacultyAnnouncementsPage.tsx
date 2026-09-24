import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Trash2, Loader2, AlertCircle, Pin, Inbox } from "lucide-react";
import AnnouncementStats from "../../components/Faculty/Announcements/AnnouncementStats";
import AnnouncementList from "../../components/Faculty/Announcements/AnnouncementList";
import AnnouncementModal from "../../components/Faculty/Announcements/AnnouncementModal";
import type { Announcement } from "../../components/Faculty/Announcements/types";

import "../../styles/faculty-announcements.css";

const FACULTY_PINNED_STORAGE_KEY = "faculty_pinned_announcements";

function getStoredPinnedIds(): string[] {
  try {
    const saved = localStorage.getItem(FACULTY_PINNED_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error("Error reading faculty pinned IDs:", err);
    return [];
  }
}

export default function FacultyAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const user = useMemo(() => {
    try {
      const userJson = localStorage.getItem("user");
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const facultyId = user?.id || user?._id || "";
      const department = user?.department || "";
      const token = localStorage.getItem("token");

      const queryParams = new URLSearchParams();

      if (facultyId) {
        queryParams.append("facultyId", facultyId);
      } else if (department) {
        queryParams.append("department", department);
      }

      const res = await fetch(`/api/announcements?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load announcements from server.");
      }

      const data = await res.json();
      const storedPinnedIds = getStoredPinnedIds();

      const mappedData: Announcement[] = (Array.isArray(data) ? data : []).map((item: any) => {
        const id = item.id || item._id;
        return {
          ...item,
          id,
          pinned: storedPinnedIds.includes(id) || Boolean(item.pinned),
        };
      });

      setItems(mappedData);
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

  const handleTogglePin = (id: string) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned } : item
      );

      const pinnedIds = updated.filter((item) => item.pinned).map((item) => item.id);
      localStorage.setItem(FACULTY_PINNED_STORAGE_KEY, JSON.stringify(pinnedIds));

      return updated;
    });
  };

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

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/announcements/${deletingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete announcement from server.");
      }

      setItems((prev) => prev.filter((x) => x.id !== deletingId));
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.message || "Error deleting announcement.");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handleSaveSuccess = async () => {
    await fetchAnnouncements();
  };

  const pinnedItems = items.filter((a) => a.pinned);
  const unpinnedItems = items.filter((a) => !a.pinned);

  return (
    <div className="container-fluid py-3 py-md-4 faculty-announcements-page">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Announcements</h3>
          <p className="text-muted mb-0">
            Create and manage class announcements for {user?.department || "your department"}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary d-inline-flex align-items-center gap-2 px-3"
          onClick={handleOpenCreateModal}
        >
          <Plus size={18} />
          New Announcement
        </button>
      </div>

      <AnnouncementStats items={items} />

      {isLoading ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted my-4">
          <div className="d-flex align-items-center justify-content-center gap-2">
            <Loader2 className="spinner-border spinner-border-sm text-primary" size={22} />
            <span className="fw-medium">Loading department announcements...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      ) : (
        <div className="mt-4">
          {/* Pinned Section */}
          {pinnedItems.length > 0 && (
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Pin size={20} className="text-primary" />
                <h5 className="fw-bold mb-0">Pinned Announcements</h5>
              </div>
              <AnnouncementList
                items={pinnedItems}
                onEdit={handleEditTrigger}
                onDelete={handleDeleteTrigger}
                onTogglePin={handleTogglePin}
              />
            </div>
          )}

          {/* All / Unpinned Section */}
          <div>
            <h5 className="fw-bold mb-3">
              {pinnedItems.length > 0 ? "All Announcements" : "Recent Announcements"}
            </h5>
            {unpinnedItems.length > 0 ? (
              <AnnouncementList
                items={unpinnedItems}
                onEdit={handleEditTrigger}
                onDelete={handleDeleteTrigger}
                onTogglePin={handleTogglePin}
              />
            ) : items.length > 0 ? (
              <div className="card text-center p-4 border-dashed bg-light my-2">
                <div className="card-body d-flex flex-column align-items-center">
                  <Inbox size={40} className="text-muted mb-2" />
                  <p className="fw-semibold text-secondary mb-1">
                    All announcements are currently pinned above.
                  </p>
                </div>
              </div>
            ) : (
              <AnnouncementList
                items={[]}
                onEdit={handleEditTrigger}
                onDelete={handleDeleteTrigger}
                onTogglePin={handleTogglePin}
              />
            )}
          </div>
        </div>
      )}

      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAnnouncement(null);
        }}
        announcementToEdit={editingAnnouncement}
        onSaveSuccess={handleSaveSuccess}
      />

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
              Are you sure you want to remove this announcement? Students will no longer see it.
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
                    <Loader2 size={16} className="spinner-border spinner-border-sm" />
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