// ✅ src/components/DepartmentHead/Settings/DepartmentPreferencesCard.tsx

type DepartmentPreferencesCardProps = {
  maxUnits: string;
  isEditing: boolean;
  saving?: boolean;
  onMaxUnitsChange: (value: string) => void;
};

export default function DepartmentPreferencesCard({
  maxUnits,
  isEditing,
  saving = false,
  onMaxUnitsChange,
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
              disabled={!isEditing || saving}
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
        </div>
      </div>
    </div>
  );
}