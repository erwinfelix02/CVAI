// ✅ src/components/DepartmentHead/Subjects/SubjectTable.tsx

import {
  Pencil,
  Trash2,
} from "lucide-react";

export interface SubjectRow {
  id: number;
  code: string;
  name: string;
  units: number;
  year: string;
  semester: string;
  program: string;
  faculty: string;
}

interface SubjectTableProps {
  subjects: SubjectRow[];

  onEdit?: (subject: SubjectRow) => void;

  onDelete?: (subject: SubjectRow) => void;
}

export default function SubjectTable({
  subjects,
  onEdit,
  onDelete,
}: SubjectTableProps) {
  if (subjects.length === 0) {
    return (
      <div className="subjects-empty-state">
        <div className="subjects-empty-icon">
          <Trash2 size={28} />
        </div>

        <h5>No subjects found</h5>

        <p>
          Try changing your search or program filter.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* =====================================================
          DESKTOP TABLE
          ===================================================== */}

      <div className="subjects-desktop-table">
        <div className="table-responsive">
          <table className="table subjects-table mb-0">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject</th>
                <th>Units</th>
                <th>Year / Sem</th>
                <th>Program</th>
                <th>Faculty</th>
                <th className="text-end">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id}>
                  {/* Code */}
                  <td>
                    <span className="subject-code">
                      {subject.code}
                    </span>
                  </td>

                  {/* Subject */}
                  <td>
                    <span className="subject-name">
                      {subject.name}
                    </span>
                  </td>

                  {/* Units */}
                  <td>
                    <span className="subject-units">
                      {subject.units}
                    </span>
                  </td>

                  {/* Year / Semester */}
                  <td>
                    <span className="subject-year-sem">
                      {subject.year}
                      <span> · </span>
                      {subject.semester}
                    </span>
                  </td>

                  {/* Program */}
                  <td>
                    <span className="subject-program-badge">
                      {subject.program}
                    </span>
                  </td>

                  {/* Faculty */}
                  <td>
                    {subject.faculty ? (
                      <span className="subject-faculty">
                        {subject.faculty}
                      </span>
                    ) : (
                      <span className="subject-unassigned">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="subject-actions justify-content-end">
                      <button
                        type="button"
                        className="subject-action-btn subject-edit-btn"
                        title="Edit subject"
                        onClick={() =>
                          onEdit?.(subject)
                        }
                      >
                        <Pencil size={19} />
                      </button>

                      <button
                        type="button"
                        className="subject-action-btn subject-delete-btn"
                        title="Delete subject"
                        onClick={() =>
                          onDelete?.(subject)
                        }
                      >
                        <Trash2 size={19} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          MOBILE CARDS
          ===================================================== */}

      <div className="subjects-mobile-list">
        {subjects.map((subject) => (
          <div
            className="subject-mobile-card"
            key={subject.id}
          >
            {/* Top */}
            <div className="subject-mobile-header">
              <div>
                <div className="subject-mobile-code">
                  {subject.code}
                </div>

                <div className="subject-mobile-name">
                  {subject.name}
                </div>
              </div>

              <span className="subject-program-badge">
                {subject.program}
              </span>
            </div>

            {/* Details */}
            <div className="subject-mobile-details">
              <div>
                <span className="subject-mobile-label">
                  Units
                </span>

                <span className="subject-mobile-value">
                  {subject.units}
                </span>
              </div>

              <div>
                <span className="subject-mobile-label">
                  Year / Semester
                </span>

                <span className="subject-mobile-value">
                  {subject.year} · {subject.semester}
                </span>
              </div>

              <div>
                <span className="subject-mobile-label">
                  Faculty
                </span>

                <span className="subject-mobile-value">
                  {subject.faculty || "Unassigned"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="subject-mobile-actions">
              <button
                type="button"
                className="subject-mobile-edit"
                onClick={() =>
                  onEdit?.(subject)
                }
              >
                <Pencil size={17} />
                Edit
              </button>

              <button
                type="button"
                className="subject-mobile-delete"
                onClick={() =>
                  onDelete?.(subject)
                }
              >
                <Trash2 size={17} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}