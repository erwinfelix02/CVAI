import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Save, X, User } from "lucide-react";
import type { Gender, UserStatus } from "./types";
import type { UserForm } from "./RoleDetailsView";

type ModalMode = "add" | "edit";

type Props = {
  open: boolean;
  mode: ModalMode;
  roleName: string;
  form: UserForm;
  canSubmit: boolean;
  onFormChange: (next: UserForm) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function UserFormModal({
  open,
  mode,
  roleName,
  form,
  canSubmit,
  onFormChange,
  onClose,
  onSubmit,
}: Props) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = useState(false);

  // ✅ Reset validation state whenever modal opens
  useEffect(() => {
    if (!open) return;
    setTouched({});
    setDirty({});
    setAttempted(false);
  }, [open, mode]);

  // ✅ ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const digitsOnly = (v: string) => v.replace(/[^\d]/g, "");
  const isValidPhone = (phone: string) => {
    const p = digitsOnly(phone);
    return p.length >= 10 && p.length <= 13;
  };

  const errors = useMemo(() => {
    return {
      userId: !form.userId.trim() ? "User ID is required." : "",
      firstName: !form.firstName.trim() ? "First name is required." : "",
      lastName: !form.lastName.trim() ? "Last name is required." : "",
      gender: !form.gender ? "Gender is required." : "",
      houseNo: !form.houseNo.trim() ? "House number is required." : "",
      email: !isValidEmail(form.email) ? "Enter a valid email address." : "",
      phone: !isValidPhone(form.phone) ? "Enter a valid phone number." : "",
    };
  }, [form]);

  // ✅ Show error ONLY when:
  // - submit attempted, OR
  // - field was blurred AND user changed it (dirty)
  const showErr = (key: keyof typeof errors) =>
    Boolean(errors[key]) && (attempted || (touched[key] && dirty[key]));

  const setField = <K extends keyof UserForm>(k: K, v: UserForm[K]) => {
    setDirty((p) => (p[k as string] ? p : { ...p, [k as string]: true }));
    onFormChange({ ...form, [k]: v });
  };

  const markTouched = (key: keyof typeof errors) => {
    if (!dirty[key as string]) return; // ✅ prevents error on click in/out
    setTouched((p) => ({ ...p, [key as string]: true }));
  };

  const submit = () => {
    setAttempted(true);
    if (!canSubmit) return;
    onSubmit();
  };

  if (!open) return null;

  return (
    <>
      {/* backdrop */}
      <div className="modal-backdrop fade show" onClick={onClose} />

      {/* modal */}
      <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
          {/* ✅ ONE CARD ONLY: modal-content IS the card */}
          <div className="modal-content shadow-lg rounded-4 overflow-hidden bg-white">
            {/* HEADER */}
            <div className="modal-header px-4 py-3 bg-white border-bottom">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-3 border bg-light flex-shrink-0"
                  style={{ width: 44, height: 44 }}
                >
                  {mode === "add" ? <Plus size={18} /> : <Pencil size={18} />}
                </div>

                <div className="lh-sm">
                  <div className="fw-bold fs-5 mb-1">
                    {mode === "add" ? "Add User" : "Edit User"}
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
  <span className="text-muted small">Assigning to role:</span>

  <span
    className="badge rounded-pill bg-primary-subtle text-primary-emphasis border px-3 py-2 fs-6"
    style={{ maxWidth: 320 }}
    title={roleName || "—"}
  >
    <span className="d-inline-block text-truncate" style={{ maxWidth: 300 }}>
      {roleName?.trim() ? roleName : "No role selected"}
    </span>
  </span>
</div>

                </div>
              </div>

              {/* ✅ icon-only close button */}
              <button
  type="button"
  className="btn btn-light border rounded-3 d-inline-flex align-items-center justify-content-center ms-auto"
  style={{ width: 48, height: 48 }}   // 👈 bigger hit area
  onClick={onClose}
  aria-label="Close"
>
  <X size={24} />   {/* 👈 bigger icon */}
</button>

            </div>

            {/* BODY (no inner card anymore) */}
            <div className="modal-body bg-white p-4 p-lg-5">
              {/* Title line like your screenshot */}
              <div className="d-flex align-items-start align-items-md-center justify-content-between gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center bg-primary-subtle border flex-shrink-0"
                    style={{ width: 44, height: 44 }}
                  >
                    <User size={18} />
                  </div>

                  <div>
                    <div className="fw-bold fs-4 mb-0">Personal Information</div>
                    <div className="text-muted small">
                      Please fill in the required details.
                    </div>
                  </div>
                </div>

                <span className="badge rounded-pill text-bg-light border px-3 py-2">
                  Fields marked <span className="text-danger">*</span> are required
                </span>
              </div>

              {/* FORM GRID */}
              <div className="row g-4">
                {/* First Name */}
                <div className="col-12 col-lg-4">
                  <label className="form-label">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input
                    className={`form-control ${showErr("firstName") ? "is-invalid" : ""}`}
                    value={form.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    onBlur={() => markTouched("firstName")}
                    placeholder="Enter first name"
                    autoFocus
                  />
                  {showErr("firstName") && (
                    <div className="invalid-feedback">{errors.firstName}</div>
                  )}
                </div>

                {/* Middle Name */}
                <div className="col-12 col-lg-4">
                  <label className="form-label">Middle Name</label>
                  <input
                    className="form-control"
                    value={form.middleName}
                    onChange={(e) => setField("middleName", e.target.value)}
                    placeholder="Enter middle name (optional)"
                  />
                </div>

                {/* Last Name */}
                <div className="col-12 col-lg-4">
                  <label className="form-label">
                    Last Name <span className="text-danger">*</span>
                  </label>
                  <input
                    className={`form-control ${showErr("lastName") ? "is-invalid" : ""}`}
                    value={form.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    onBlur={() => markTouched("lastName")}
                    placeholder="Enter last name"
                  />
                  {showErr("lastName") && (
                    <div className="invalid-feedback">{errors.lastName}</div>
                  )}
                </div>

                {/* Email */}
                <div className="col-12 col-lg-7">
                  <label className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${showErr("email") ? "is-invalid" : ""}`}
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    onBlur={() => markTouched("email")}
                    placeholder="Enter email address"
                  />
                  {showErr("email") && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                {/* Phone */}
                <div className="col-12 col-lg-5">
                  <label className="form-label">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    className={`form-control ${showErr("phone") ? "is-invalid" : ""}`}
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    onBlur={() => markTouched("phone")}
                    placeholder="09xxxxxxxxx"
                    inputMode="tel"
                  />
                  {showErr("phone") && (
                    <div className="invalid-feedback">{errors.phone}</div>
                  )}
                  <div className="form-text">Use 10–13 digits (PH numbers supported).</div>
                </div>

                {/* User ID */}
                <div className="col-12 col-lg-4">
                  <label className="form-label">
                    User ID <span className="text-danger">*</span>
                  </label>
                  <input
                    className={`form-control ${showErr("userId") ? "is-invalid" : ""}`}
                    value={form.userId}
                    onChange={(e) => setField("userId", e.target.value)}
                    onBlur={() => markTouched("userId")}
                    placeholder="STU-2025-001"
                  />
                  {showErr("userId") && (
                    <div className="invalid-feedback">{errors.userId}</div>
                  )}
                </div>

                {/* House No */}
                <div className="col-12 col-lg-4">
                  <label className="form-label">
                    House No. <span className="text-danger">*</span>
                  </label>
                  <input
                    className={`form-control ${showErr("houseNo") ? "is-invalid" : ""}`}
                    value={form.houseNo}
                    onChange={(e) => setField("houseNo", e.target.value)}
                    onBlur={() => markTouched("houseNo")}
                    placeholder="House/Unit No."
                  />
                  {showErr("houseNo") && (
                    <div className="invalid-feedback">{errors.houseNo}</div>
                  )}
                </div>

                {/* Gender */}
                <div className="col-12 col-lg-4">
                  <label className="form-label">
                    Gender <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${showErr("gender") ? "is-invalid" : ""}`}
                    value={form.gender || ""}
                    onChange={(e) => setField("gender", e.target.value as Gender)}
                    onBlur={() => markTouched("gender")}
                  >
                    <option value="" disabled>
                      Select gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {showErr("gender") && (
                    <div className="invalid-feedback">{errors.gender}</div>
                  )}
                </div>

                <div className="col-12">
                  <hr className="my-1" />
                </div>

                {/* Status */}
                <div className="col-12 col-lg-4">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={(e) => setField("status", e.target.value as UserStatus)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <div className="form-text">
                    Inactive users can’t access portals until enabled.
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="modal-footer bg-white px-4 py-3 border-top d-flex gap-2 justify-content-end">
              <button className="btn btn-light border" onClick={onClose}>
                Cancel
              </button>

              <button
                className="btn btn-primary d-inline-flex align-items-center gap-2"
                onClick={submit}
                disabled={!canSubmit}
              >
                <Save size={16} />
                {mode === "add" ? "Add User" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
