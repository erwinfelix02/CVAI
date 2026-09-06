import { useState } from "react";
import { Edit2, Save, X, AlertTriangle, HelpCircle, CheckCircle2 } from "lucide-react";

export default function FacultyPreferencesSettings() {
  const [isEditing, setIsEditing] = useState(false);

  const initialLandingPage = "dashboard";
  const [landingPage, setLandingPage] = useState(initialLandingPage);

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isDirty = landingPage !== initialLandingPage;

  const handleCancelClick = () => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      handleDiscard();
    }
  };

  const handleDiscard = () => {
    setLandingPage(initialLandingPage);
    setIsEditing(false);
    setShowExitConfirm(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = () => {
    setShowSaveConfirm(false);
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      setIsEditing(false);
    }, 1800);
  };

  return (
    <>
      <div className="card faculty-settings-card shadow-sm">
        <div className="card-body p-3 p-md-4">
          <h3 className="fw-bold mb-1">Preferences</h3>
          <p className="text-muted mb-4">Customize your portal experience</p>

          <form onSubmit={handleFormSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Default landing page</label>
                <select
                  className="form-select"
                  value={landingPage}
                  disabled={!isEditing}
                  onChange={(e) => setLandingPage(e.target.value)}
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="schedule">Schedule</option>
                  <option value="classes">My Classes</option>
                </select>
              </div>
            </div>

            {/* BUTTONS AT THE BOTTOM (CANCEL ON THE LEFT) */}
            <div className="mt-4">
              {!isEditing ? (
                <button
                  type="button"
                  className="btn btn-primary faculty-settings-savebtn"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={18} className="me-2" />
                  Edit
                </button>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-light border px-3"
                    onClick={handleCancelClick}
                  >
                    <X size={18} className="me-1" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary faculty-settings-savebtn"
                    disabled={!isDirty}
                  >
                    <Save size={18} className="me-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* DISCARD CONFIRMATION OVERLAY */}
      {showExitConfirm && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 1060,
          }}
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered px-3"
            style={{ maxWidth: "440px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 text-center p-4">
              <div
                className="mx-auto mb-3 text-warning bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "56px", height: "56px" }}
              >
                <AlertTriangle size={28} />
              </div>
              <h5 className="fw-bold text-dark mb-1">Discard Changes?</h5>
              <p className="text-secondary small mb-4">
                You have modified your preferences. Canceling now will reset your selection.
              </p>

              <div className="d-flex gap-3 justify-content-center">
                <button
                  type="button"
                  className="btn btn-light flex-fill py-2.5 px-3 rounded-3 text-dark fw-medium border-0 text-nowrap"
                  onClick={() => setShowExitConfirm(false)}
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  className="btn btn-danger flex-fill py-2.5 px-3 rounded-3 fw-medium text-nowrap"
                  onClick={handleDiscard}
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAVE CONFIRMATION OVERLAY */}
      {showSaveConfirm && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 1060,
          }}
          onClick={() => setShowSaveConfirm(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered px-3"
            style={{ maxWidth: "440px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 text-center p-4">
              <div
                className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "56px",
                  height: "56px",
                  backgroundColor: "rgba(13, 92, 117, 0.1)",
                  color: "#0d5c75",
                }}
              >
                <HelpCircle size={30} />
              </div>
              <h5 className="fw-bold text-dark mb-1">Save Preferences?</h5>
              <p className="text-secondary small mb-4">
                Are you sure you want to update your portal preferences?
              </p>

              <div className="d-flex gap-3 justify-content-center">
                <button
                  type="button"
                  className="btn btn-light flex-fill py-2.5 px-3 rounded-3 text-dark fw-medium border-0 text-nowrap"
                  onClick={() => setShowSaveConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn text-white flex-fill py-2.5 px-3 rounded-3 fw-medium text-nowrap shadow-sm"
                  style={{ backgroundColor: "#0d5c75" }}
                  onClick={handleConfirmSave}
                >
                  Confirm & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 1060,
          }}
        >
          <div className="modal-dialog modal-dialog-centered px-3" style={{ maxWidth: "400px" }}>
            <div className="modal-content border-0 shadow-lg rounded-4 text-center p-4">
              <div
                className="mx-auto mb-3 text-success bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "56px", height: "56px" }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h5 className="fw-bold text-dark mb-1">Preferences Saved!</h5>
              <p className="text-secondary small mb-0">
                Your portal experience settings have been updated successfully.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}