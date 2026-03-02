import { Pencil, Trash2 } from "lucide-react";
import type { DepartmentItem } from "./types";

type Props = {
  items: DepartmentItem[];
  onEdit: (item: DepartmentItem) => void;
  onDelete: (item: DepartmentItem) => void;
};

export default function DepartmentsTable({ items, onEdit, onDelete }: Props) {
  return (
    <div className="sad-table-wrap">
      <table className="table sad-table align-middle mb-0">
        <thead>
          <tr>
            <th style={{ width: 110 }}>Code</th>
            <th>Department Name</th>
            <th className="d-none d-md-table-cell" style={{ width: 240 }}>
              Department Head
            </th>
            <th style={{ width: 140 }}>Status</th>
            <th style={{ width: 120 }} className="text-end">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((d) => (
            <tr key={d.id}>
              <td className="fw-semibold">{d.code}</td>

              <td>
                <div className="sad-dept-name">{d.name}</div>
                <div className="sad-dept-desc">{d.description}</div>

                {/* ✅ mobile-only head */}
                <div className="d-md-none sad-mobile-head">
                  <span className="text-muted">Head:</span> {d.head || "—"}
                </div>
              </td>

              <td className="d-none d-md-table-cell">{d.head || "—"}</td>

              <td>
                <span
                  className={`sad-pill ${
                    d.status === "Active" ? "sad-pill-active" : "sad-pill-inactive"
                  }`}
                >
                  {d.status}
                </span>
              </td>

              <td className="text-end">
                <button
                  className="btn sad-icon-btn"
                  onClick={() => onEdit(d)}
                  aria-label="Edit"
                  title="Edit"
                >
                  <Pencil size={18} />
                </button>

                <button
                  className="btn sad-icon-btn sad-danger"
                  onClick={() => onDelete(d)}
                  aria-label="Delete"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}