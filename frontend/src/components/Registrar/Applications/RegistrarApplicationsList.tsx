import type { ApplicationRow } from "./types";
import RegistrarApplicationRow from "./RegistrarApplicationRow";
import { Users } from "lucide-react";

type Props = {
  title: string;
  items: ApplicationRow[];
  onReview: (id: string) => void;
  selectedApprovedIds: Set<string>;
  onToggleApproved: (id: string) => void;
  onDeselectAllApproved: () => void;
  onSendSchedule: () => void;
};

export default function RegistrarApplicationsList({
  title,
  items,
  onReview,
  selectedApprovedIds,
  onToggleApproved,
  onDeselectAllApproved,
  onSendSchedule,
}: Props) {
  // ✅ count only selectable approved students (not schedule sent)
  const selectedCount = items.filter(
    (a) => a.status === "Approved" && !a.scheduleSent && selectedApprovedIds.has(a.id),
  ).length;

  return (
    <div className="card shadow-sm registrar-card">
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h5 className="fw-bold mb-0">{title}</h5>

          {selectedCount > 0 && (
            <button
              type="button"
              className="btn btn-link registrar-link-action"
              onClick={onDeselectAllApproved}
            >
              <Users size={16} />
              <span className="ms-2">Deselect All Approved</span>
            </button>
          )}
        </div>

        <div className="d-flex flex-column gap-3">
          {items.map((a) => (
            <RegistrarApplicationRow
              key={a.id}
              item={a}
              onReview={onReview}
              isApprovedSelected={
                a.status === "Approved" && !a.scheduleSent && selectedApprovedIds.has(a.id)
              } // ✅ only selected if not sent
              onToggleApproved={onToggleApproved}
              onSendSchedule={onSendSchedule}
            />
          ))}

          {items.length === 0 && (
            <div className="text-muted text-center py-4">
              No applications found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
