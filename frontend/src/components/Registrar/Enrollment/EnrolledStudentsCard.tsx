import React, { useMemo } from "react";
import { Search, Mail, Users, Archive } from "lucide-react";

import EnrolledStudentsList from "./EnrolledStudentsList";
import type { EnrollmentItem } from "./types";

export type EnrolledStudentsCardProps = {
  enrolledCount: number;
  archivedCount: number;
  onOpenArchived: () => void;

  enrolledQuery: string;
  setEnrolledQuery: React.Dispatch<React.SetStateAction<string>>;

  loading: boolean;
  items: EnrollmentItem[];

  selectedIds: string[];
  onToggleSelect: (id: string) => void;

  onSelectAll: (ids: string[]) => void;
  onClearAll: () => void;

  onSendCredentials: () => void;
  onSendCredentialsOne: (enrollmentId: string) => void;
  onArchiveOne: (enrollmentId: string) => void;
};

export default function EnrolledStudentsCard({
  enrolledCount,
  archivedCount,
  onOpenArchived,
  enrolledQuery,
  setEnrolledQuery,
  loading,
  items,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearAll,
  onSendCredentials,
  onSendCredentialsOne,
  onArchiveOne,
}: EnrolledStudentsCardProps) {
  const selectableIds = useMemo(
    () => items.filter((x) => !x.credentialsSent).map((x) => x._id),
    [items],
  );

  const selectedCount = selectedIds.length;
  const allSelected =
    selectableIds.length > 0 && selectedCount === selectableIds.length;

  const hasItems = items.length > 0;

  return (
    <div className="card shadow-sm enroll-card mt-3 mt-md-4">
      <div className="card-body">
        <div className="enrolled-head">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <h5 className="fw-bold mb-0">Enrolled Students ({enrolledCount})</h5>

            <button
              type="button"
              className="registrar-pill archived"
              onClick={onOpenArchived}
            >
              <Archive size={16} />
              <span className="ms-2">{archivedCount} Archived</span>
            </button>
          </div>

          <div className="enrolled-head-actions">
            <button
              type="button"
              className="enrolled-link-btn"
              onClick={allSelected ? onClearAll : () => onSelectAll(selectableIds)}
              disabled={selectableIds.length === 0}
            >
              <Users size={18} />
              {allSelected ? "Deselect All" : "Select All"}
            </button>

            <button
              type="button"
              className="btn-teal"
              onClick={onSendCredentials}
              disabled={selectedCount === 0}
            >
              <Mail size={18} />
              Send Account Credentials ({selectedCount})
            </button>
          </div>
        </div>

        <div className="mt-3">
          <div className="enroll-searchbar">
            <Search size={18} className="enroll-search-icon" />
            <input
              type="text"
              className="enroll-search-input"
              placeholder="Filter enrolled students by name or ID..."
              value={enrolledQuery}
              onChange={(e) => setEnrolledQuery(e.target.value)}
              disabled={!loading && !hasItems}
            />
          </div>
        </div>

        <div className="mt-3">
          {loading ? (
            <div className="text-muted text-center py-4">Loading...</div>
          ) : hasItems ? (
            <EnrolledStudentsList
              loading={loading}
              items={items}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
              onSendCredentialsOne={onSendCredentialsOne}
              onArchiveOne={onArchiveOne}
            />
          ) : (
            <div className="users-empty-state">
              <div className="users-empty-icon">📭</div>
              <h5 className="fw-semibold mb-1">No enrolled students found</h5>
              <p className="text-muted mb-0">
                Try adjusting your search or check back after enrollment updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}