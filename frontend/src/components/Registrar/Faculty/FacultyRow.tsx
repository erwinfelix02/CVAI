import { Send, Eye } from "lucide-react";

export type Faculty = {
  id: string; // MongoDB _id
  idNumber: string; // display ID
  name: string;
  email: string;
  department: string;
  status: "Active" | "Inactive";
};

type RowProps = {
  faculty: Faculty;
  onSendCredentials: (faculty: Faculty) => void;
};

export default function FacultyRow({ faculty, onSendCredentials }: RowProps) {
  const initials = faculty.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <tr className="faculty-row align-middle">
      {/* Faculty */}
      <td>
        <div className="d-flex align-items-center gap-3">
          <div className="avatar">{initials}</div>

          <div className="faculty-info">
            <div className="faculty-name">{faculty.name}</div>
            <div className="faculty-email">{faculty.email}</div>
          </div>
        </div>
      </td>

      {/* Faculty ID */}
      <td className="text-nowrap">{faculty.idNumber}</td>

      {/* Department */}
      <td>{faculty.department}</td>

      {/* Status */}
      <td>
        <span
          className={`status-pill ${
            faculty.status === "Active" ? "status-active" : "status-inactive"
          }`}
        >
          {faculty.status}
        </span>
      </td>

      {/* Actions */}
      <td className="text-end align-middle">
        <div className="d-inline-flex align-items-center gap-2">
          {/* Send (only if inactive) */}
          {faculty.status === "Inactive" && (
            <button
              className="btn btn-icon action-btn"
              title="Send login credentials"
              onClick={() => onSendCredentials(faculty)}
            >
              <Send size={18} />
            </button>
          )}

          {/* View (Eye icon) */}
          <button
            className="btn btn-icon action-btn"
            title="View faculty details"
            aria-label="View faculty details"
          >
            <Eye size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
