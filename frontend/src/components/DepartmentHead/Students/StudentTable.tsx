// src/components/DepartmentHead/Students/StudentTable.tsx

import React from 'react';
import type { DepartmentStudent } from './departmentStudent';
import { StudentStatusBadge } from './StudentStatusBadge';
import { Eye, GraduationCap, UserX, ArrowRightLeft } from 'lucide-react';

interface StudentTableProps {
  students: DepartmentStudent[];
  onViewStudent: (student: DepartmentStudent) => void;
  onRequestDrop: (student: DepartmentStudent) => void;
  onRequestTransfer: (student: DepartmentStudent) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({ 
  students, 
  onViewStudent, 
  onRequestDrop, 
  onRequestTransfer 
}) => {
  if (students.length === 0) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
        <div className="mb-3 text-muted">
          <GraduationCap size={48} className="opacity-50" />
        </div>
        <h5 className="fw-semibold text-dark">No students found</h5>
        <p className="text-muted small mb-0">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden d-none d-md-block bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-uppercase fs-7 text-secondary">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Course / Program</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const isPending = student.workflowState === 'Transfer Pending' || student.workflowState === 'Drop Requested' || student.status === 'Dropped';
                const displayStatus = student.workflowState && student.workflowState !== 'None' ? student.workflowState : student.status;

                return (
                  <tr key={student.id}>
                    <td className="py-3 px-4">
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className="rounded-circle bg-light text-primary d-flex align-items-center justify-content-center border"
                          style={{ width: '40px', height: '40px', minWidth: '40px' }}
                        >
                          <GraduationCap size={20} />
                        </div>
                        <div>
                          <div className="fw-semibold text-dark">{student.name}</div>
                          <div className="text-muted small">{student.studentNo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 fw-medium text-secondary">{student.year}</td>
                    <td className="py-3 px-4">
                      <StudentStatusBadge status={displayStatus} type="status" />
                    </td>
                    <td className="py-3 px-4">
                      <StudentStatusBadge status={student.course} type="course" />
                    </td>
                    <td className="py-3 px-4 fw-medium text-secondary">{student.section}</td>
                    <td className="py-3 px-4 text-end">
                      <div className="d-flex align-items-center justify-content-end gap-3">
                        {/* View Icon */}
                        <button
                          type="button"
                          onClick={() => onViewStudent(student)}
                          className="btn btn-link p-0 text-secondary text-decoration-none shadow-none"
                          title="View Student Details"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Request Program Transfer Icon */}
                        {!isPending && (
                          <button
                            type="button"
                            onClick={() => onRequestTransfer(student)}
                            className="btn btn-link p-0 text-primary text-decoration-none shadow-none"
                            title="Request Program Transfer / Shift Course"
                          >
                            <ArrowRightLeft size={18} />
                          </button>
                        )}

                        {/* Request Drop Icon */}
                        {!isPending && (
                          <button
                            type="button"
                            onClick={() => onRequestDrop(student)}
                            className="btn btn-link p-0 text-danger text-decoration-none shadow-none"
                            title="Request Drop to Registrar"
                          >
                            <UserX size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};