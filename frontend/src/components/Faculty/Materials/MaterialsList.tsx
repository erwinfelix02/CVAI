import { useState, useEffect, useRef } from "react";
import { Download, MoreHorizontal, FileText, Video, FolderOpen, Eye, Edit2, Share2, Trash2 } from "lucide-react";
import type { MaterialItem } from "./types";

type Props = {
  materials: MaterialItem[];
  totalCount: number;
  onViewDetails?: (item: MaterialItem) => void;
  onEdit?: (item: MaterialItem) => void;
  onShareLink?: (item: MaterialItem) => void;
  onDelete?: (id: string) => void;
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
  onShareLink,
  onDelete,
}: Props) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="card shadow-sm faculty-materials-list border-0 rounded-4">
      <div className="card-body p-3 p-md-4">
        <h5 className="fw-bold mb-3">
          All Materials ({totalCount})
        </h5>

        <div className="d-flex flex-column gap-3">
          {materials.map((m) => (
            <div key={m.id} className="material-row position-relative">
              {/* Left Side */}
              <div className="material-left">
                <div className={`material-icon ${m.type}`}>
                  {typeIcon(m.type)}
                </div>

                <div className="minw-0">
                  <div className="material-title">{m.title}</div>
                  <div className="text-muted small">
                    {m.sizeLabel} &nbsp;•&nbsp; {m.date}
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div className="material-right d-flex align-items-center gap-2">
                <span className="badge rounded-pill bg-white text-dark border px-3 py-2">
                  {m.course}
                </span>

                <button className="btn btn-light border icon-btn" title="Download">
                  <Download size={18} />
                </button>

                <div className="downloads-count text-muted">
                  {m.downloads}
                </div>

                {/* Dropdown Menu Container */}
                <div className="position-relative" ref={activeMenuId === m.id ? menuRef : null}>
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

                      <button
                        type="button"
                        className="btn btn-link text-decoration-none text-dark w-100 text-start py-2 px-3 rounded-2 d-flex align-items-center gap-2 hover-bg-light"
                        onClick={() => {
                          setActiveMenuId(null);
                          onShareLink?.(m);
                        }}
                      >
                        <Share2 size={16} className="text-secondary" />
                        <span>Share Link</span>
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
          {materials.length === 0 && (
            <div className="text-center py-5 px-3 my-2 bg-light bg-opacity-50 rounded-4 border border-dashed">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm mb-3 text-secondary"
                style={{ width: 64, height: 64 }}
              >
                <FolderOpen size={30} className="text-muted" />
              </div>
              <h6 className="fw-bold text-dark mb-1 fs-5">No materials found</h6>
              <p className="text-muted small mb-0 mx-auto" style={{ maxWidth: 360 }}>
                There are no course materials available yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}