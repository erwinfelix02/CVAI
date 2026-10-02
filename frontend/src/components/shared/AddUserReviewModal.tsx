import { useEffect } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";

export type ReviewUserData = {
  firstName: string;
  middleName?: string;
  lastName: string;
  idNumber: string;
  email: string;
  phone: string;
  gender: string;
  role: string;
  department: string;
  status: string;
};

type Props = {
  open: boolean;
  data: ReviewUserData;
  onBack: () => void;
  onConfirm: (payload: ReviewUserData) => void;
  isLoading?: boolean;
};

export default function AddUserReviewModal({
  open,
  data,
  onBack,
  onConfirm,
  isLoading = false,
}: Props) {
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onBack();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open, onBack, isLoading]);

  if (!open) return null;

  const fullName = [data.firstName, data.middleName, data.lastName]
    .filter(Boolean)
    .join(" ");

  const handleSubmit = () => {
    onConfirm(data);
  };

  return (
    <div
      className="users-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onBack();
        }
      }}
    >
      <div
        className="users-modal users-modal-compact"
        role="dialog"
        aria-modal="true"
        aria-label="Review Application"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="users-modal-header">
          <div className="users-review-title">
            <h3 className="users-modal-title">
              Review Application
              <CheckCircle size={20} className="users-review-check" />
            </h3>
          </div>

          <button
            type="button"
            className="users-modal-close app-icon-btn app-icon-btn-sm"
            onClick={onBack}
            aria-label="Close"
            title="Close"
            disabled={isLoading}
          >
            <X size={18} />
          </button>
        </div>

        <div className="users-modal-body space-y-6">
          <div className="users-review-grid">
            <section className="users-review-card">
              <h4>Personal Information</h4>
              <p><b>Name:</b> {fullName}</p>
              <p><b>Email:</b> {data.email}</p>
              <p><b>Phone:</b> {data.phone}</p>
              <p><b>Gender:</b> {data.gender}</p>
              <p><b>ID Number:</b> {data.idNumber}</p>
            </section>

            <section className="users-review-card">
              <h4>Portal Information</h4>
              <p><b>Role:</b> {data.role}</p>
              <p><b>Department:</b> {data.department}</p>
              <p>
                <b>Initial Status:</b>{" "}
                <span className="text-danger">{data.status}</span>
              </p>
            </section>
          </div>

          <section className="users-review-disclaimer">
            The account will be created as <b>{data.status}</b>.
            Credentials can be sent later from the Users table.
          </section>
        </div>

        <div className="users-modal-footer">
          <button
            type="button"
            className="btn btn-light users-btn"
            onClick={onBack}
            disabled={isLoading}
          >
            Back to Edit
          </button>

          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating...
              </>
            ) : (
              "Confirm & Create"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}