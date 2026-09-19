import { useState, useEffect, useRef } from "react";
import {
  Download,
  MoreHorizontal,
  FileText,
  Video,
  FolderOpen,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  X,
  FileCheck,
} from "lucide-react";
import type { MaterialItem } from "./types";

type Props = {
  materials: MaterialItem[];
  totalCount: number;
  onViewDetails?: (item: MaterialItem) => void;
  onEdit?: (item: MaterialItem) => void;
  onDelete?: (id: string) => void;
};

// Robust date parser converting "9/11/2026" or "2026-09-11" to "Friday, September 11, 2026"
const formatReadableDate = (dateStr: string): string => {
  if (!dateStr) return "";

  let year: number, month: number, day: number;

  if (dateStr.includes("/")) {
    const parts = dateStr.split("/").map((p) => parseInt(p, 10));
    if (parts.length === 3 && !parts.some(isNaN)) {
      month = parts[0] - 1;
      day = parts[1];
      year = parts[2];
    }
  } else if (dateStr.includes("-")) {
    const cleanDate = dateStr.split("T")[0];
    const parts = cleanDate.split("-").map((p) => parseInt(p, 10));
    if (parts.length === 3 && !parts.some(isNaN)) {
      year = parts[0];
      month = parts[1] - 1;
      day = parts[2];
    }
  }

  if (year! && month! !== undefined && day!) {
    const localDate = new Date(year, month, day);
    if (!isNaN(localDate.getTime())) {
      return localDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return dateStr;
};

function typeIcon(type: MaterialItem["type"]) {
  if (type === "video") return <Video size={18} />;
  return <FileText size={18} />;
}

export default function MaterialsList({
  materials,
  totalCount,
  onViewDetails,
  onEdit,
  onDelete,
}: Props) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [items, setItems] = useState<MaterialItem[]>(materials);
  const menuRef = useRef<HTMLDivElement>(null);

  // Download Confirmation Modal State
  const [downloadingItem, setDownloadingItem] = useState<MaterialItem | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setItems(materials);
  }, [materials]);

  // Close dropdown menu when clicking anywhere outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (id: string) => {
    setActiveMenuId((prev) => (prev === id ? null : id));
  };

  /* =========================================================
     TRIGGER DOWNLOAD CONFIRMATION MODAL
     ========================================================= */
  const handleOpenDownloadConfirm = (m: MaterialItem) => {
    setDownloadingItem(m);
  };

  /* =========================================================
     EXECUTE DIRECT FILE DOWNLOAD AFTER CONFIRMATION
     ========================================================= */
  const handleConfirmDownload = async () => {
    if (!downloadingItem) return;

    setIsDownloading(true);

    try {
      const m = downloadingItem;

      // 1. Increment download count state locally and on backend
      setItems((prev) =>
        prev.map((item) =>
          item.id === m.id ? { ...item, downloads: item.downloads + 1 } : item
        )
      );

      // 2. Trigger file download endpoint based on type
      if (m.filePath) {
        const downloadUrl = `/api/materials/${m.id}/file`;

        const response = await fetch(downloadUrl);
        if (!response.ok) {
          window.open(m.filePath, "_blank");
          return;
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = blobUrl;

        const ext = m.filePath.substring(m.filePath.lastIndexOf("."));
        a.download = `${m.title}${ext}`;

        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Error downloading file:", err);
      if (downloadingItem?.filePath) {
        window.open(downloadingItem.filePath, "_blank");
      }
    } finally {
      setIsDownloading(false);
      setDownloadingItem(null);
    }
  };

  return (
    <div className="card shadow-sm faculty-materials-list border-0 rounded-4">
      <div className="card-body p-3 p-md-4">
        <h5 className="fw-bold mb-3">All Materials ({totalCount})</h5>

        <div className="d-flex flex-column gap-3">
          {items.map((m) => (
            <div key={m.id} className="material-row position-relative">
              {/* Left Side */}
              <div className="material-left">
                <div className={`material-icon ${m.type}`}>
                  {typeIcon(m.type)}
                </div>

                <div className="minw-0">
                  <div className="material-title">{m.title}</div>
                  <div className="text-muted small">
                    {m.sizeLabel} &nbsp;•&nbsp; {formatReadableDate(m.date)}
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div className="material-right d-flex align-items-center gap-2">
                <span className="badge rounded-pill bg-white text-dark border px-3 py-2">
                  {m.course}
                </span>

                <button
                  type="button"
                  className="btn btn-light border icon-btn"
                  title={`Download ${m.type.toUpperCase()}`}
                  onClick={() => handleOpenDownloadConfirm(m)}
                >
                  <Download size={18} />
                </button>

                <div className="downloads-count text-muted">{m.downloads}</div>

                {/* Dropdown Menu Container */}
                <div
                  className="position-relative"
                  ref={activeMenuId === m.id ? menuRef : null}
                >
                  <button
                    type="button"
                    className="btn btn-light border icon-btn"
                    title="More options"
                    onClick={() => toggleMenu(m.id)}
                  >
                    <MoreHorizontal size={18} />
                  </button>

                  {/* Context Menu Popup */}
                  {activeMenuId === m.id && (
                    <div
                      className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-2 z-3"
                      style={{ width: "170px" }}
                    >
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none text-dark w-100 text-start py-2 px-3 rounded-2 d-flex align-items-center gap-2 hover-bg-light"
                        onClick={() => {
                          setActiveMenuId(null);
                          onViewDetails?.(m);
                        }}
                      >
                        <Eye size={16} className="text-secondary" />
                        <span>View Details</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-link text-decoration-none text-dark w-100 text-start py-2 px-3 rounded-2 d-flex align-items-center gap-2 hover-bg-light"
                        onClick={() => {
                          setActiveMenuId(null);
                          onEdit?.(m);
                        }}
                      >
                        <Edit2 size={16} className="text-secondary" />
                        <span>Edit</span>
                      </button>

                      <div className="dropdown-divider my-1 border-top" />

                      <button
                        type="button"
                        className="btn btn-link text-decoration-none text-danger w-100 text-start py-2 px-3 rounded-2 d-flex align-items-center gap-2 hover-bg-light"
                        onClick={() => {
                          setActiveMenuId(null);
                          onDelete?.(m.id);
                        }}
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Clean Empty State */}
          {items.length === 0 && (
            <div className="text-center py-5 px-3 my-2 bg-light bg-opacity-50 rounded-4 border border-dashed">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm mb-3 text-secondary"
                style={{ width: 64, height: 64 }}
              >
                <FolderOpen size={30} className="text-muted" />
              </div>
              <h6 className="fw-bold text-dark mb-1 fs-5">No materials found</h6>
              <p
                className="text-muted small mb-0 mx-auto"
                style={{ maxWidth: 360 }}
              >
                There are no course materials available yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          DOWNLOAD CONFIRMATION MODAL OVERLAY
          ========================================================= */}
      {downloadingItem && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 modal-blur-backdrop"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 1080,
          }}
          onClick={() => {
            if (!isDownloading) setDownloadingItem(null);
          }}
        >
          <div
            className="bg-white rounded-4 p-4 shadow-lg text-center position-relative"
            style={{ maxWidth: 420, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="btn btn-light p-1 position-absolute top-0 end-0 m-3 rounded-circle border-0 text-muted"
              disabled={isDownloading}
              onClick={() => setDownloadingItem(null)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary mb-3"
              style={{ width: 56, height: 56 }}
            >
              <FileCheck size={28} />
            </div>

            <h5 className="fw-bold text-dark mb-1">Download Material?</h5>
            <p className="text-muted small mb-3">
              Are you sure you want to download <strong>{downloadingItem.title}</strong>?
            </p>

            <div className="bg-light p-3 rounded-3 mb-4 text-start small">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Course:</span>
                <span className="fw-semibold text-dark">{downloadingItem.course}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Type:</span>
                <span className="fw-semibold text-uppercase text-dark">{downloadingItem.type}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">File Size:</span>
                <span className="fw-semibold text-dark">{downloadingItem.sizeLabel}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Upload Date:</span>
                <span className="fw-semibold text-dark">{formatReadableDate(downloadingItem.date)}</span>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-light border w-50 py-2 rounded-3 fw-medium text-muted"
                disabled={isDownloading}
                onClick={() => setDownloadingItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary w-50 py-2 rounded-3 fw-medium d-inline-flex align-items-center justify-content-center gap-2"
                disabled={isDownloading}
                onClick={handleConfirmDownload}
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={16} className="spinner-border spinner-border-sm" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Download
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}