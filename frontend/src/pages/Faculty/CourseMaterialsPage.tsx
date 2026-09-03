import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Upload,
  Loader2,
  AlertCircle,
  Trash2,
  Eye,
  X,
  Download,
  Calendar,
  HardDrive,
  BookOpen,
  User,
  Building,
  Share2,
  Copy,
  Check,
} from "lucide-react";

import MaterialsFilters from "../../components/Faculty/Materials/MaterialsFilters";
import MaterialsStats from "../../components/Faculty/Materials/MaterialsStats";
import MaterialsList from "../../components/Faculty/Materials/MaterialsList";
import UploadMaterialModal from "../../components/Faculty/Materials/UploadMaterialModal";
import type { MaterialItem } from "../../components/Faculty/Materials/types";

import "../../styles/faculty-materials.css";

export default function CourseMaterialsPage() {
  const [materialsList, setMaterialsList] = useState<MaterialItem[]>([]);
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);
  const [viewingMaterial, setViewingMaterial] = useState<MaterialItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Custom Share Link & Delete Modal States
  const [sharingLink, setSharingLink] = useState<{ id: string; title: string; url: string } | null>(null);
  const [hasCopiedLink, setHasCopiedLink] = useState(false);
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const user = useMemo(() => {
    try {
      const userJson = localStorage.getItem("user");
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }, []);

  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const facultyId = user?.id || user?._id || "";
      const department = user?.department || "";

      const queryParams = new URLSearchParams();
      if (facultyId) queryParams.append("facultyId", facultyId);
      if (department) queryParams.append("department", department);

      const res = await fetch(`/api/materials?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load materials from server.");
      }

      const data = await res.json();
      setMaterialsList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("fetchMaterials error:", err);
      setError(err.message || "Failed to fetch materials.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const courses = useMemo(() => {
    const unique = Array.from(new Set(materialsList.map((m) => m.course)));
    return ["All Courses", ...unique];
  }, [materialsList]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return materialsList.filter((m) => {
      const matchCourse = courseFilter === "All Courses" || m.course === courseFilter;
      const matchSearch =
        q.length === 0 ||
        m.title.toLowerCase().includes(q) ||
        m.course.toLowerCase().includes(q);
      return matchCourse && matchSearch;
    });
  }, [materialsList, courseFilter, search]);

  const stats = useMemo(() => {
    return {
      totalFiles: materialsList.length,
      videos: materialsList.filter((m) => m.type === "video").length,
      documents: materialsList.filter((m) => m.type !== "video").length,
      downloads: materialsList.reduce((sum, m) => sum + m.downloads, 0),
    };
  }, [materialsList]);

  const handleOpenUploadModal = () => {
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const handleUploadSuccess = (newMaterial: MaterialItem) => {
    setMaterialsList((prev) => [newMaterial, ...prev]);
  };

  const handleEditSuccess = (updatedMaterial: MaterialItem) => {
    setMaterialsList((prev) =>
      prev.map((m) => (m.id === updatedMaterial.id ? updatedMaterial : m))
    );
  };

  const handleViewDetails = (item: MaterialItem) => {
    setViewingMaterial(item);
  };

  const handleEdit = (item: MaterialItem) => {
    setEditingMaterial(item);
    setIsModalOpen(true);
  };

  // Trigger centered UI Share Link Modal
  const handleShareLink = (item: MaterialItem) => {
    const url = `${window.location.origin}/materials/${item.id}`;
    setSharingLink({ id: item.id, title: item.title, url });
    setHasCopiedLink(false);
  };

  const handleCopyShareLink = () => {
    if (!sharingLink) return;
    navigator.clipboard.writeText(sharingLink.url);
    setHasCopiedLink(true);
    setTimeout(() => setHasCopiedLink(false), 3000);
  };

  const handleDeleteTrigger = (id: string) => {
    setDeletingMaterialId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingMaterialId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/materials/${deletingMaterialId}`, { method: "DELETE" });
      if (res.ok) {
        setMaterialsList((prev) => prev.filter((m) => m.id !== deletingMaterialId));
      } else {
        alert("Failed to delete material from server.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setMaterialsList((prev) => prev.filter((m) => m.id !== deletingMaterialId));
    } finally {
      setIsDeleting(false);
      setDeletingMaterialId(null);
    }
  };

  return (
    <div className="container-fluid faculty-materials-scope">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Course Materials</h3>
          <p className="text-muted mb-0">
            Upload and manage course materials for students in {user?.department || "your department"}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-success d-inline-flex align-items-center gap-2 px-3"
          onClick={handleOpenUploadModal}
        >
          <Upload size={18} />
          Upload Material
        </button>
      </div>

      <MaterialsFilters
        courses={courses}
        courseFilter={courseFilter}
        setCourseFilter={setCourseFilter}
        search={search}
        setSearch={setSearch}
      />

      <MaterialsStats stats={stats} />

      {isLoading ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted my-4">
          <div className="d-flex align-items-center justify-content-center gap-2">
            <Loader2 className="spinner-border spinner-border-sm text-primary" size={22} />
            <span className="fw-medium">Loading department materials...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      ) : (
        <MaterialsList
          materials={filtered}
          totalCount={materialsList.length}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onShareLink={handleShareLink}
          onDelete={handleDeleteTrigger}
        />
      )}

      {/* Upload/Edit Modal */}
      <UploadMaterialModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMaterial(null);
        }}
        materialToEdit={editingMaterial}
        courses={courses.length > 1 ? courses : ["All Courses", "CS 101", "CS 201", "CS 301"]}
        onUploadSuccess={handleUploadSuccess}
        onEditSuccess={handleEditSuccess}
      />

      {/* ==================== CENTERED VIEW DETAILS MODAL ==================== */}
      {viewingMaterial && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 modal-blur-backdrop"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 1080,
          }}
          onClick={() => setViewingMaterial(null)}
        >
          <div
            className="bg-white rounded-4 shadow-lg overflow-hidden position-relative"
            style={{ maxWidth: 520, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-bottom d-flex align-items-center justify-content-between bg-light bg-opacity-50">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary"
                  style={{ width: 44, height: 44 }}
                >
                  <Eye size={22} />
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-0 fs-5">Material Details</h5>
                  <span className="text-muted small">View comprehensive resource info</span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-light p-2 rounded-circle border-0 d-flex align-items-center justify-content-center text-secondary"
                aria-label="Close"
                onClick={() => setViewingMaterial(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill text-uppercase fw-semibold mb-2" style={{ fontSize: "0.75rem" }}>
                  {viewingMaterial.type} Material
                </span>
                <h4 className="fw-bold text-dark mb-1">{viewingMaterial.title}</h4>
                <p className="text-muted small mb-0">
                  {viewingMaterial.description || "No additional description provided for this material."}
                </p>
              </div>

              <div className="row g-3 p-3 bg-light rounded-3 mb-4">
                <div className="col-6 d-flex align-items-center gap-2">
                  <BookOpen size={18} className="text-muted" />
                  <div>
                    <div className="text-muted small" style={{ fontSize: "0.75rem" }}>Course</div>
                    <div className="fw-semibold text-dark small">{viewingMaterial.course}</div>
                  </div>
                </div>

                <div className="col-6 d-flex align-items-center gap-2">
                  <HardDrive size={18} className="text-muted" />
                  <div>
                    <div className="text-muted small" style={{ fontSize: "0.75rem" }}>File Size</div>
                    <div className="fw-semibold text-dark small">{viewingMaterial.sizeLabel}</div>
                  </div>
                </div>

                <div className="col-6 d-flex align-items-center gap-2">
                  <Calendar size={18} className="text-muted" />
                  <div>
                    <div className="text-muted small" style={{ fontSize: "0.75rem" }}>Upload Date</div>
                    <div className="fw-semibold text-dark small">{viewingMaterial.date}</div>
                  </div>
                </div>

                <div className="col-6 d-flex align-items-center gap-2">
                  <Download size={18} className="text-muted" />
                  <div>
                    <div className="text-muted small" style={{ fontSize: "0.75rem" }}>Downloads</div>
                    <div className="fw-semibold text-dark small">{viewingMaterial.downloads} times</div>
                  </div>
                </div>

                {viewingMaterial.uploadedBy && (
                  <div className="col-6 d-flex align-items-center gap-2">
                    <User size={18} className="text-muted" />
                    <div>
                      <div className="text-muted small" style={{ fontSize: "0.75rem" }}>Uploaded By</div>
                      <div className="fw-semibold text-dark small">{viewingMaterial.uploadedBy}</div>
                    </div>
                  </div>
                )}

                {viewingMaterial.department && (
                  <div className="col-6 d-flex align-items-center gap-2">
                    <Building size={18} className="text-muted" />
                    <div>
                      <div className="text-muted small" style={{ fontSize: "0.75rem" }}>Department</div>
                      <div className="fw-semibold text-dark small">{viewingMaterial.department}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-top d-flex align-items-center justify-content-end gap-2 bg-light bg-opacity-25">
              <button
                type="button"
                className="btn btn-light border px-4 py-2 rounded-3 fw-medium text-muted"
                onClick={() => setViewingMaterial(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CENTERED SHARE LINK MODAL ==================== */}
      {sharingLink && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 modal-blur-backdrop"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 1080,
          }}
          onClick={() => setSharingLink(null)}
        >
          <div
            className="bg-white rounded-4 p-4 shadow-lg text-center"
            style={{ maxWidth: 440, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-info bg-opacity-10 text-info mb-3"
              style={{ width: 56, height: 56 }}
            >
              <Share2 size={28} />
            </div>
            <h5 className="fw-bold text-dark mb-1">Share Material</h5>
            <p className="text-muted small mb-3">
              Copy the direct URL below to share <strong>{sharingLink.title}</strong> with students.
            </p>

            {/* Link Copy Box */}
            <div className="input-group mb-3">
              <input
                type="text"
                readOnly
                className="form-control bg-light border-end-0 fs-6 text-muted shadow-none"
                value={sharingLink.url}
              />
              <button
                type="button"
                className={`btn d-flex align-items-center gap-1 px-3 fw-medium transition-all ${
                  hasCopiedLink ? "btn-success" : "btn-primary"
                }`}
                onClick={handleCopyShareLink}
              >
                {hasCopiedLink ? (
                  <>
                    <Check size={16} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copy
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              className="btn btn-light border w-100 py-2 rounded-3 fw-medium text-muted"
              onClick={() => setSharingLink(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ==================== CENTERED DELETE CONFIRMATION MODAL ==================== */}
      {deletingMaterialId && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 modal-blur-backdrop"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 1080,
          }}
          onClick={() => {
            if (!isDeleting) setDeletingMaterialId(null);
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
            <h5 className="fw-bold text-dark mb-1">Delete Material?</h5>
            <p className="text-muted small mb-4">
              Are you sure you want to delete this course material? This action cannot be undone.
            </p>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-light border w-50 py-2 rounded-3 fw-medium text-muted"
                disabled={isDeleting}
                onClick={() => setDeletingMaterialId(null)}
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