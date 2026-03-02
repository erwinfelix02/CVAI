import FacultyRow, { type Faculty } from "./FacultyRow";

type Props = {
  faculty: Faculty[];
  onSendCredentials: (faculty: Faculty) => void;
  onViewDetails: (faculty: Faculty) => void;
  onEdit: (faculty: Faculty) => void;
};

export default function FacultyTable(props: Props) {
  const { faculty, onSendCredentials, onViewDetails, onEdit } = props;

  return (
    <div className="card shadow-sm faculty-card">
      <div className="card-body p-0">
        <div className="p-3">
          <h5 className="fw-bold mb-0">Faculty ({faculty.length})</h5>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0 faculty-table">
            <thead>
              <tr className="table-head">
                <th>Faculty</th>
                <th>Faculty ID</th>
                <th>Department</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {faculty.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    No faculty found.
                  </td>
                </tr>
              ) : (
                faculty.map((f) => (
                  <FacultyRow
                    key={f.id}
                    faculty={f}
                    onSendCredentials={onSendCredentials}
                    onViewDetails={onViewDetails}
                    onEdit={onEdit}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}