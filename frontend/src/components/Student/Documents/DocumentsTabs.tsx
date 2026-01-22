export type DocTabKey = "available" | "request" | "pending";

export default function DocumentsTabs({
  active,
  onChange,
  pendingCount,
}: {
  active: DocTabKey;
  onChange: (key: DocTabKey) => void;
  pendingCount: number;
}) {
  return (
    <div className="d-flex">
      <ul className="nav nav-pills bg-light p-1 rounded-3 flex-wrap gap-1">
        <li className="nav-item">
          <button
            className={`nav-link rounded-3 ${active === "available" ? "active" : ""}`}
            onClick={() => onChange("available")}
            type="button"
          >
            Available
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link rounded-3 ${active === "request" ? "active" : ""}`}
            onClick={() => onChange("request")}
            type="button"
          >
            Request
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link rounded-3 d-flex align-items-center gap-2 ${active === "pending" ? "active" : ""}`}
            onClick={() => onChange("pending")}
            type="button"
          >
            Pending
            <span className="badge text-bg-secondary">{pendingCount}</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
