import { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Save,
  X,
  User,
  Mail,
  Phone,
  Home,
  BadgeCheck,
  IdCard,
} from "lucide-react";
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
  const [attempted, setAttempted] = useState(false);

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
  }, [form, isValidEmail]);

  const showErr = (key: keyof typeof errors) =>
    Boolean(errors[key]) && (attempted || touched[key]);

  const setField = <K extends keyof UserForm>(k: K, v: UserForm[K]) => {
    onFormChange({ ...form, [k]: v });
  };

  const markTouched = (key: string) =>
    setTouched((p) => ({ ...p, [key]: true }));

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
      <div
        className="modal d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
          <div className="modal-content shadow-lg rounded-4 overflow-hidden">
            {/* HEADER */}
            <div className="modal-header px-4 py-3 bg-white">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-3 border bg-light"
                  style={{ width: 42, height: 42 }}
                >
                  {mode === "add" ? <Plus size={18} /> : <Pencil size={18} />}
                </div>

                <div className="lh-sm">
                  <div className="fw-bold fs-5">
                    {mode === "add" ? "Add User" : "Edit User"}
                  </div>
                  <div className="text-muted small">
                    Assigning to role:{" "}
                    <span className="badge text-bg-primary-subtle border">
                      {roleName}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-light border d-inline-flex align-items-center justify-content-center rounded-3"
                style={{ width: 38, height: 38 }}
                onClick={onClose}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* BODY */}
            <div className="modal-body p-4 bg-body-tertiary">
              <div className="row g-3">
                {/* BASIC INFO CARD */}
                <div className="col-12 col-lg-7">
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="fw-bold d-flex align-items-center gap-2">
                          <User size={18} />
                          Basic Information
                        </div>
                        <span className="text-muted small">
                          Fields with <span className="text-danger">*</span> are
                          required
                        </span>
                      </div>

                      <div className="row g-3">
                        {/* User ID */}
                        <div className="col-12 col-sm-6 col-lg-4">
                          <label className="form-label">
                            User ID <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-white">
                              <IdCard size={16} />
                            </span>
                            <input
                              className={`form-control ${
                                showErr("userId") ? "is-invalid" : ""
                              }`}
                              value={form.userId}
                              onChange={(e) =>
                                setField("userId", e.target.value)
                              }
                              onBlur={() => markTouched("userId")}
                              placeholder="STU-2025-001"
                            />
                            {showErr("userId") && (
                              <div className="invalid-feedback">
                                {errors.userId}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Gender */}
                        <div className="col-12 col-sm-6 col-lg-4">
                          <label className="form-label">
                            Gender <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-white">
                              <User size={16} />
                            </span>
                            <select
                              className={`form-select ${
                                showErr("gender") ? "is-invalid" : ""
                              }`}
                              value={form.gender}
                              onChange={(e) =>
                                setField("gender", e.target.value as Gender)
                              }
                              onBlur={() => markTouched("gender")}
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Prefer not to say">
                                Prefer not to say
                              </option>
                            </select>
                            {showErr("gender") && (
                              <div className="invalid-feedback">
                                {errors.gender}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* House No */}
                        <div className="col-12 col-sm-6 col-lg-4">
                          <label className="form-label">
                            House No. <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-white">
                              <Home size={16} />
                            </span>
                            <input
                              className={`form-control ${
                                showErr("houseNo") ? "is-invalid" : ""
                              }`}
                              value={form.houseNo}
                              onChange={(e) =>
                                setField("houseNo", e.target.value)
                              }
                              onBlur={() => markTouched("houseNo")}
                              placeholder="123"
                            />
                            {showErr("houseNo") && (
                              <div className="invalid-feedback">
                                {errors.houseNo}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* First */}
                        <div className="col-12 col-sm-6">
                          <label className="form-label">
                            First Name <span className="text-danger">*</span>
                          </label>
                          <input
                            className={`form-control ${
                              showErr("firstName") ? "is-invalid" : ""
                            }`}
                            value={form.firstName}
                            onChange={(e) =>
                              setField("firstName", e.target.value)
                            }
                            onBlur={() => markTouched("firstName")}
                            placeholder="Juan"
                            autoFocus
                          />
                          {showErr("firstName") && (
                            <div className="invalid-feedback">
                              {errors.firstName}
                            </div>
                          )}
                        </div>

                        {/* Middle */}
                        <div className="col-12 col-sm-6">
                          <label className="form-label">Middle Name</label>
                          <input
                            className="form-control"
                            value={form.middleName}
                            onChange={(e) =>
                              setField("middleName", e.target.value)
                            }
                            placeholder="Optional"
                          />
                        </div>

                        {/* Last */}
                        <div className="col-12 col-sm-6">
                          <label className="form-label">
                            Last Name <span className="text-danger">*</span>
                          </label>
                          <input
                            className={`form-control ${
                              showErr("lastName") ? "is-invalid" : ""
                            }`}
                            value={form.lastName}
                            onChange={(e) =>
                              setField("lastName", e.target.value)
                            }
                            onBlur={() => markTouched("lastName")}
                            placeholder="Dela Cruz"
                          />
                          {showErr("lastName") && (
                            <div className="invalid-feedback">
                              {errors.lastName}
                            </div>
                          )}
                        </div>

                        <div className="col-12 col-sm-6 d-none d-sm-block" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CONTACT + STATUS CARD */}
                <div className="col-12 col-lg-5">
                  <div className="card border-0 shadow-sm rounded-4 h-100">
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="fw-bold d-flex align-items-center gap-2 mb-3">
                        <Mail size={18} />
                        Contact & Access
                      </div>

                      {/* Email */}
                      <div className="mb-3">
                        <label className="form-label">
                          Email <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-white">
                            <Mail size={16} />
                          </span>
                          <input
                            type="email"
                            className={`form-control ${
                              showErr("email") ? "is-invalid" : ""
                            }`}
                            value={form.email}
                            onChange={(e) => setField("email", e.target.value)}
                            onBlur={() => markTouched("email")}
                            placeholder="juan@university.edu"
                          />
                          {showErr("email") && (
                            <div className="invalid-feedback">
                              {errors.email}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="mb-3">
                        <label className="form-label">
                          Phone <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-white">
                            <Phone size={16} />
                          </span>
                          <input
                            className={`form-control ${
                              showErr("phone") ? "is-invalid" : ""
                            }`}
                            value={form.phone}
                            onChange={(e) => setField("phone", e.target.value)}
                            onBlur={() => markTouched("phone")}
                            placeholder="09123456789"
                            inputMode="tel"
                          />
                          {showErr("phone") && (
                            <div className="invalid-feedback">
                              {errors.phone}
                            </div>
                          )}
                        </div>
                        <div className="form-text">
                          Use 10–13 digits (PH numbers supported).
                        </div>
                      </div>

                      <hr className="my-3" />

                      {/* Status */}
                      <div className="mb-2">
                        <label className="form-label">Status</label>
                        <div className="input-group">
                          <span className="input-group-text bg-white">
                            <BadgeCheck size={16} />
                          </span>
                          <select
                            className="form-select"
                            value={form.status}
                            onChange={(e) =>
                              setField("status", e.target.value as UserStatus)
                            }
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                        <div className="form-text">
                          Inactive users can’t access portals until enabled.
                        </div>
                      </div>

                      <div className="mt-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER (sticky) */}
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
