import React, { useMemo } from "react";
import { Search, Mail, Users } from "lucide-react";

import EnrolledStudentsList from "./EnrolledStudentsList";
import type { EnrollmentItem } from "./types";

export type EnrolledStudentsCardProps = {
  enrolledCount: number;

  enrolledQuery: string;
  setEnrolledQuery: React.Dispatch<React.SetStateAction<string>>;

  loading: boolean;
  items: EnrollmentItem[];

  selectedIds: string[];
  onToggleSelect: (id: string) => void;

  // ✅ now accepts ids
  onSelectAll: (ids: string[]) => void;
  onClearAll: () => void;

  onSendCredentials: () => void;
  onSendCredentialsOne: (enrollmentId: string) => void;
};

export default function EnrolledStudentsCard({
  enrolledCount,
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
}: EnrolledStudentsCardProps) {
  // ✅ only selectable if NOT yet sent
  const selectableIds = useMemo(
    () => items.filter((x) => !x.credentialsSent).map((x) => x._id),
    [items],
  );

  const selectedCount = selectedIds.length;
  const allSelected =
    selectableIds.length > 0 && selectedCount === selectableIds.length;

  return (
    <div className="card shadow-sm enroll-card mt-3 mt-md-4">
      <div className="card-body">
        <div className="enrolled-head">
          <h5 className="fw-bold mb-0">Enrolled Students ({enrolledCount})</h5>

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
            />
          </div>
        </div>

        <div className="mt-3">
          <EnrolledStudentsList
            loading={loading}
            items={items}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
            onSendCredentialsOne={onSendCredentialsOne}
          />
        </div>
      </div>
    </div>
  );
}