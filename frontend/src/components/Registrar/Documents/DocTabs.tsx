type Props = {
  active: "All" | "Pending" | "Ready";
  onChange: (v: "All" | "Pending" | "Ready") => void;
  counts: { pending: number; ready: number };
};

export default function DocTabs({ active, onChange, counts }: Props) {
  return (
    <div className="docs-tabs mb-3">
      <button
        type="button"
        className={`docs-tab ${active === "All" ? "active" : ""}`}
        onClick={() => onChange("All")}
      >
        All Requests
      </button>

      <button
        type="button"
        className={`docs-tab ${active === "Pending" ? "active" : ""}`}
        onClick={() => onChange("Pending")}
      >
        Pending ({counts.pending})
      </button>

      <button
        type="button"
        className={`docs-tab ${active === "Ready" ? "active" : ""}`}
        onClick={() => onChange("Ready")}
      >
        Ready ({counts.ready})
      </button>
    </div>
  );
}
