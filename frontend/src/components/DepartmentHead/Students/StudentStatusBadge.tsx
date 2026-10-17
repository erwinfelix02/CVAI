// src/components/DepartmentHead/Students/StudentStatusBadge.tsx

import React from 'react';

interface StudentStatusBadgeProps {
  status: string;
  type?: 'status' | 'course';
}

export const StudentStatusBadge: React.FC<StudentStatusBadgeProps> = ({ status, type = 'status' }) => {
  if (type === 'course') {
    return (
      <span className="badge bg-primary-subtle text-primary fw-medium px-2 py-1">
        {status}
      </span>
    );
  }

  // Handle workflow states or status flags
  let badgeClass = 'bg-secondary-subtle text-secondary';
  if (status === 'Enrolled' || status === 'good' || status === 'Active') {
    badgeClass = 'bg-success-subtle text-success';
  } else if (status === 'Transfer Pending' || status === 'Drop Requested') {
    badgeClass = 'bg-warning-subtle text-warning fw-semibold';
  } else if (status === 'Dropped' || status === 'Inactive') {
    badgeClass = 'bg-danger-subtle text-danger';
  }

  return (
    <span className={`badge ${badgeClass} px-2 py-1`}>
      {status}
    </span>
  );
};