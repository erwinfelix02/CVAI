import { MoreHorizontal, Download } from "lucide-react";
import type { MaterialItem } from "./types";

function typeIconClass(type: MaterialItem["type"]) {
  if (type === "video") return "mat-icon video";
  if (type === "pdf") return "mat-icon pdf";
  return "mat-icon doc";
}

export default function MaterialRow({ item }: { item: MaterialItem }) {
  return (
    <div className="material-row">
      {/* Left */}
      <div className="material-left">
        <div className={typeIconClass(item.type)} aria-hidden="true">
          {/* simple icon block */}
        </div>

        <div className="material-info">
          <div className="material-title" title={item.title}>
            {item.title}
          </div>
          <div className="material-meta">
            {item.sizeLabel} &nbsp;•&nbsp; {item.date}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="material-right">
        <span className="badge rounded-pill bg-white border text-dark px-3 py-2">
          {item.course}
        </span>

        <button className="icon-btn" type="button" title="Download">
          <Download size={18} />
        </button>

        <div className="downloads-count">{item.downloads}</div>

        <button className="icon-btn" type="button" title="More">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}
