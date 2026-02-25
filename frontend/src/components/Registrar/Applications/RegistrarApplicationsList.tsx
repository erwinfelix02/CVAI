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
    (a) =>
      a.status === "Approved" &&
      !a.scheduleSent &&
      selectedApprovedIds.has(a.id),
  ).length;

  const hasItems = items.length > 0;

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
          {hasItems ? (
            items.map((a) => (
              <RegistrarApplicationRow
                key={a.id}
                item={a}
                onReview={onReview}
                isApprovedSelected={
                  a.status === "Approved" &&
                  !a.scheduleSent &&
                  selectedApprovedIds.has(a.id)
                }
                onToggleApproved={onToggleApproved}
                onSendSchedule={onSendSchedule}
              />
            ))
          ) : (
            // ✅ Empty state like UsersPage
            <div className="users-empty-state py-5">
              <div className="users-empty-icon">📭</div>
              <h5 className="fw-semibold mb-1">No applications found</h5>
              <p className="text-muted mb-0">
                Applications will appear here once submitted.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}