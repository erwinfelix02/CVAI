// ✅ src/components/DepartmentHead/Settings/DepartmentPreferencesCard.tsx

type DepartmentPreferencesCardProps = {
  maxUnits: string;
  semester: string;
  isEditing: boolean;
  onMaxUnitsChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
};

export default function DepartmentPreferencesCard({
  maxUnits,
  semester,
  isEditing,
  onMaxUnitsChange,
  onSemesterChange,
}: DepartmentPreferencesCardProps) {
  return (
    <div className="card shadow-sm rounded-4 border-0">
      <div className="card-body p-4">
        {/* Header */}
        <div className="mb-4">
          <h5 className="fw-bold mb-1">
            Department Preferences
          </h5>

          <p className="text-muted mb-0 small">
            Configure your department settings
          </p>
        </div>

        <div className="row g-3">
          {/* Maximum Teaching Units */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold">
              Maximum Teaching Units
            </label>

            <select
              className="form-select"
              value={maxUnits}
              disabled={!isEditing}
              onChange={(e) =>
                onMaxUnitsChange(e.target.value)
              }
            >
              <option value="18 units">18 units</option>
              <option value="21 units">21 units</option>
              <option value="24 units">24 units</option>
              <option value="27 units">27 units</option>
            </select>
          </div>

          {/* Current Semester */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold">
              Current Semester
            </label>

            <select
              className="form-select"
              value={semester}
              disabled={!isEditing}
              onChange={(e) =>
                onSemesterChange(e.target.value)
              }
            >
              <option value="1st Semester">
                1st Semester
              </option>

              <option value="2nd Semester">
                2nd Semester
              </option>

              <option value="Summer">
                Summer
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}