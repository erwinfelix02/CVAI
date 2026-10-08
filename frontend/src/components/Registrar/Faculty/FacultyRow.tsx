import { Send, Eye, Pencil } from "lucide-react";

export type Faculty = {
  id: string;
  idNumber: string;
  name: string;
  email: string;
  department: string;
  phone?: string;
  credentialsSent?: boolean; // ✅ controls Edit visibility
  status: "Active" | "Inactive";
};

type RowProps = {
  faculty: Faculty;
  onSendCredentials: (faculty: Faculty) => void;
  onViewDetails: (faculty: Faculty) => void;
  onEdit: (faculty: Faculty) => void; // ✅ NEW
};

export default function FacultyRow({
  faculty,
  onSendCredentials,
  onViewDetails,
  onEdit,
}: RowProps) {
  const initials = faculty.name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  // ✅ If credentials are not yet sent, allow sending.
  const canSendCredentials = !faculty.credentialsSent;

  // ✅ Edit button must NOT appear if credentials not sent
  const canEdit = !!faculty.credentialsSent;

  return (
    <tr className="faculty-row align-middle">
      <td>
        <div className="d-flex align-items-center gap-3">
          <div className="avatar">{initials}</div>

          <div className="faculty-info">
            <div className="faculty-name">{faculty.name}</div>
            <div className="faculty-email">{faculty.email}</div>
          </div>
        </div>
      </td>

      <td className="text-nowrap">{faculty.idNumber}</td>
      <td>{faculty.department}</td>

      <td>
        <span
          className={`status-pill ${
            faculty.status === "Active" ? "status-active" : "status-inactive"
          }`}
        >
          {faculty.status}
        </span>
      </td>

      <td className="text-end align-middle">
        <div className="d-inline-flex align-items-center gap-2">
          {/* ✅ SEND: show only if credentials NOT sent yet */}
          {canSendCredentials && (
            <button
              className="btn btn-icon action-btn"
              title="Send login credentials"
              aria-label="Send login credentials"
              onClick={() => onSendCredentials(faculty)}
            >
              <Send size={18} />
            </button>
          )}

          {/* ✅ EDIT: show only if credentials already sent */}
          {canEdit && (
            <button
              className="btn btn-icon action-btn"
              title="Edit faculty account"
              aria-label="Edit faculty account"
              onClick={() => onEdit(faculty)}
            >
              <Pencil size={18} />
            </button>
          )}

          {/* ✅ VIEW: always show */}
          <button
            className="btn btn-icon action-btn"
            title="View faculty details"
            aria-label="View faculty details"
            onClick={() => onViewDetails(faculty)}
          >
            <Eye size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}