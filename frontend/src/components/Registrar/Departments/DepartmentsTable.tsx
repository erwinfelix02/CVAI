import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { DepartmentItem } from "./types";

type Props = {
  items: DepartmentItem[];
  onEdit: (item: DepartmentItem) => void;
  onDelete: (item: DepartmentItem) => void;
};

export default function DepartmentsTable({
  items,
  onEdit,
  onDelete,
}: Props) {
  const [confirmItem, setConfirmItem] = useState<DepartmentItem | null>(null);

  const handleConfirmDelete = () => {
    if (!confirmItem) return;
    onDelete(confirmItem);
    setConfirmItem(null);
  };

  return (
    <>
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

                  <div className="d-md-none sad-mobile-head">
                    <span className="text-muted">Head:</span>{" "}
                    {d.head || "—"}
                  </div>
                </td>

                <td className="d-none d-md-table-cell">
                  {d.head || "—"}
                </td>

                <td>
                  <span
                    className={`sad-status-pill ${
                      d.status === "Active"
                        ? "sad-status-pill-active"
                        : "sad-status-pill-inactive"
                    }`}
                  >
                    {d.status}
                  </span>
                </td>

                <td className="text-end">
                  <div className="sad-actions">
                    <button
                      type="button"
                      className="sad-icon-btn"
                      onClick={() => onEdit(d)}
                      aria-label="Edit"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      className="sad-icon-btn sad-icon-btn-danger"
                      onClick={() => setConfirmItem(d)}
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ DELETE CONFIRMATION MODAL */}
      {confirmItem && (
        <div
          className="sad-confirm-backdrop"
          onClick={() => setConfirmItem(null)}
        >
          <div
            className="sad-confirm-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h5 className="fw-bold mb-2">Confirm Delete</h5>

            <p className="mb-3 text-muted">
              Are you sure you want to delete{" "}
              <strong>{confirmItem.name}</strong>?
              <br />
              This action cannot be undone.
            </p>

            <div className="sad-confirm-actions">
              <button
                className="btn btn-light"
                onClick={() => setConfirmItem(null)}
              >
                Cancel
              </button>

              <button
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}