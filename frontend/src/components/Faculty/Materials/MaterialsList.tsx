import { Download, MoreHorizontal, FileText, Video } from "lucide-react";
import type { MaterialItem } from "./types";

type Props = {
  materials: MaterialItem[];
  totalCount: number;
};

function typeIcon(type: MaterialItem["type"]) {
  if (type === "video") return <Video size={18} />;
  return <FileText size={18} />;
}

export default function MaterialsList({ materials, totalCount }: Props) {
  return (
    <div className="card shadow-sm faculty-materials-list">
      <div className="card-body p-3 p-md-4">
        <h5 className="fw-bold mb-3">
          All Materials ({totalCount})
        </h5>

        <div className="d-flex flex-column gap-3">
          {materials.map((m) => (
            <div key={m.id} className="material-row">
              {/* Left */}
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

              {/* Right */}
              <div className="material-right">
                <span className="badge rounded-pill bg-white text-dark border px-3 py-2">
                  {m.course}
                </span>

                <button className="btn btn-light border icon-btn" title="Download">
                  <Download size={18} />
                </button>

                <div className="downloads-count text-muted">
                  {m.downloads}
                </div>

                <button className="btn btn-light border icon-btn" title="More">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          ))}

          {materials.length === 0 && (
            <div className="text-center text-muted py-4">
              No materials found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
