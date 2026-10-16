import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Trash2, Loader2, AlertCircle, Pin, Inbox } from "lucide-react";
import AnnouncementStats from "../../components/DepartmentHead/Announcements/AnnouncementStats";
import AnnouncementList from "../../components/DepartmentHead/Announcements/AnnouncementList";
import AnnouncementModal from "../../components/DepartmentHead/Announcements/AnnouncementModal";
import type { Announcement } from "../../components/DepartmentHead/Announcements/types";
import { API_BASE_URL } from "../../config";

import "../../styles/department-announcements.css";

const DEPT_PINNED_STORAGE_KEY = "department_pinned_announcements";

function getStoredPinnedIds(): string[] {
  try {
    const saved = localStorage.getItem(DEPT_PINNED_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error("Error reading department pinned IDs:", err);
    return [];
  }
}

export default function DepartmentAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract user session safely
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
      const department = user?.department || "";
      const token = localStorage.getItem("token");

      const queryParams = new URLSearchParams();
      if (department) {
        queryParams.append("department", department);
      }

      // 👈 Fixed path from /department/announcements to /announcements
      const res = await fetch(
        `${API_BASE_URL}/announcements?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to load department announcements from server.");
      }

      const data = await res.json();
      const storedPinnedIds = getStoredPinnedIds();

      const mappedData: Announcement[] = (Array.isArray(data) ? data : []).map(
        (item: any) => {
          const id = item.id || item._id;
          return {
            ...item,
            id,
            pinned: storedPinnedIds.includes(id) || Boolean(item.pinned),
          };
        }
      );

      setItems(mappedData);
    } catch (err: any) {
      console.error("fetchDepartmentAnnouncements error:", err);
      setError(err.message || "Failed to fetch department announcements.");
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

      const pinnedIds = updated
        .filter((item) => item.pinned)
        .map((item) => item.id);
      localStorage.setItem(
        DEPT_PINNED_STORAGE_KEY,
        JSON.stringify(pinnedIds)
      );

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
      // 👈 Fixed path from /department/announcements to /announcements
      const res = await fetch(`${API_BASE_URL}/announcements/${deletingId}`, {
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
    <div className="container-fluid py-3 py-md-4 department-announcements-page">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Department Announcements</h3>
          <p className="text-muted mb-0">
            Publish official announcements and notices for students in{" "}
            <strong>{user?.department || "your department"}</strong>
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary d-inline-flex align-items-center gap-2 px-3"
          onClick={handleOpenCreateModal}
        >
          <Plus size={18} />
          New Department Notice
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
                <h5 className="fw-bold mb-0">Pinned Notices</h5>
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
              {pinnedItems.length > 0
                ? "All Department Announcements"
                : "Recent Department Notices"}
            </h5>
            {unpinnedItems.length > 0 ? (
              <AnnouncementList
                items={unpinnedItems}
                onEdit={handleEditTrigger}
                onDelete={handleDeleteTrigger}
                onTogglePin={handleTogglePin}
              />
            ) : (
              <div className="card text-center p-4 border-dashed bg-light my-2">
                <div className="card-body d-flex flex-column align-items-center">
                  <Inbox size={40} className="text-muted mb-2" />
                  <p className="fw-semibold text-secondary mb-1">
                    No announcements found for {user?.department || "your department"}.
                  </p>
                </div>
              </div>
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
              Are you sure you want to remove this notice? Department students will
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