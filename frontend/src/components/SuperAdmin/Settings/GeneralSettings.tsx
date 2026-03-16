import { useEffect, useMemo, useState } from "react";
import { Save, TriangleAlert, X, Pencil, Ban } from "lucide-react";
import AuthAlert from "../../Authentication/AuthAlert";
import {
  getGeneralSettings,
  updateGeneralSettings,
  type GeneralSettingsDTO,
} from "../../../api/settingsService";

type FormErrors = Partial<Record<keyof GeneralSettingsDTO, string>>;

const SQLI_PATTERN =
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE)\b|--|;|\/\*|\*\/|@@|xp_)/i;

const PHONE_PATTERN = /^[0-9+\-() ]{7,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hasSuspiciousInput(value: string) {
  return SQLI_PATTERN.test(value);
}

function validateField(
  key: keyof GeneralSettingsDTO,
  value: string,
): string {
  const v = value.trim();

  if (!v) {
    switch (key) {
      case "siteName":
        return "Site name is required.";
      case "supportEmail":
        return "Support email is required.";
      case "siteDescription":
        return "Site description is required.";
      case "schoolPhoneNumber":
        return "School phone number is required.";
      case "schoolLocation":
        return "School location is required.";
      default:
        return "This field is required.";
    }
  }

  if (hasSuspiciousInput(v)) {
    return "Suspicious input detected.";
  }

  switch (key) {
    case "siteName":
      if (v.length < 3) return "Site name must be at least 3 characters.";
      if (v.length > 120) return "Site name must not exceed 120 characters.";
      return "";

    case "supportEmail":
      if (!EMAIL_PATTERN.test(v)) return "Enter a valid email address.";
      if (v.length > 120) return "Email must not exceed 120 characters.";
      return "";

    case "siteDescription":
      if (v.length < 5) return "Site description must be at least 5 characters.";
      if (v.length > 250) return "Site description must not exceed 250 characters.";
      return "";

    case "schoolPhoneNumber":
      if (!PHONE_PATTERN.test(v)) {
        return "Enter a valid phone number.";
      }
      return "";

    case "schoolLocation":
      if (v.length < 3) return "School location must be at least 3 characters.";
      if (v.length > 150) return "School location must not exceed 150 characters.";
      return "";

    default:
      return "";
  }
}

function validateForm(form: GeneralSettingsDTO): FormErrors {
  return {
    siteName: validateField("siteName", form.siteName),
    supportEmail: validateField("supportEmail", form.supportEmail),
    siteDescription: validateField("siteDescription", form.siteDescription),
    schoolPhoneNumber: validateField(
      "schoolPhoneNumber",
      form.schoolPhoneNumber,
    ),
    schoolLocation: validateField("schoolLocation", form.schoolLocation),
  };
}

export default function GeneralSettings() {
  const [form, setForm] = useState<GeneralSettingsDTO>({
    siteName: "",
    supportEmail: "",
    siteDescription: "",
    schoolPhoneNumber: "",
    schoolLocation: "",
  });

  const [originalForm, setOriginalForm] = useState<GeneralSettingsDTO>({
    siteName: "",
    supportEmail: "",
    siteDescription: "",
    schoolPhoneNumber: "",
    schoolLocation: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [showAlert, setShowAlert] = useState(false);

  const hasErrors = useMemo(
    () => Object.values(errors).some((msg) => Boolean(msg)),
    [errors],
  );

  const isUnchanged = useMemo(
    () => JSON.stringify(form) === JSON.stringify(originalForm),
    [form, originalForm],
  );

  const show = (msg: string, type: "success" | "error") => {
    setShowAlert(false);

    setTimeout(() => {
      setAlertMessage(msg);
      setAlertType(type);
      setShowAlert(true);
    }, 50);

    setTimeout(() => setShowAlert(false), 3000);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getGeneralSettings();
        setForm(data);
        setOriginalForm(data);
        setErrors(validateForm(data));
      } catch (err: any) {
        show(err?.message || "Failed to load settings.", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        setConfirmOpen(false);
      }
    };

    if (confirmOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [confirmOpen, saving]);

  const onChange = (k: keyof GeneralSettingsDTO, v: string) => {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      setErrors((old) => ({
        ...old,
        [k]: validateField(k, v),
      }));
      return next;
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (saving) return;
    setForm(originalForm);
    setErrors(validateForm(originalForm));
    setIsEditing(false);
    setConfirmOpen(false);
  };

  const handleAskSave = () => {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    const invalid = Object.values(nextErrors).some((msg) => Boolean(msg));
    if (invalid) {
      show("Please fix the validation errors first.", "error");
      return;
    }

    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    if (saving) return;
    setConfirmOpen(false);
  };

  const onConfirmSave = async () => {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    const invalid = Object.values(nextErrors).some((msg) => Boolean(msg));
    if (invalid) {
      setConfirmOpen(false);
      show("Please fix the validation errors first.", "error");
      return;
    }

    try {
      setSaving(true);

      const sanitizedForm: GeneralSettingsDTO = {
        siteName: form.siteName.trim(),
        supportEmail: form.supportEmail.trim(),
        siteDescription: form.siteDescription.trim(),
        schoolPhoneNumber: form.schoolPhoneNumber.trim(),
        schoolLocation: form.schoolLocation.trim(),
      };

      await updateGeneralSettings(sanitizedForm);
      setOriginalForm(sanitizedForm);
      setForm(sanitizedForm);
      setErrors(validateForm(sanitizedForm));
      setConfirmOpen(false);
      setIsEditing(false);
      show("General settings saved!", "success");
    } catch (err: any) {
      show(err?.message || "Failed to save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={showAlert}
        loading={saving}
      />

      <div className="card superadmin-settings-card shadow-sm">
        <div className="card-body p-3 p-md-4">
          <h3 className="fw-bold mb-1">General Settings</h3>
          <p className="text-muted mb-4">
            Configure basic application settings and branding
          </p>

          {loading ? (
            <div className="text-muted">Loading settings…</div>
          ) : (
            <>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Site Name</label>
                  <input
                    className={`form-control ${errors.siteName ? "is-invalid" : ""}`}
                    value={form.siteName}
                    onChange={(e) => onChange("siteName", e.target.value)}
                    placeholder="Enter site name"
                    disabled={!isEditing}
                    maxLength={120}
                  />
                  {errors.siteName && (
                    <div className="invalid-feedback">{errors.siteName}</div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Support Email</label>
                  <input
                    className={`form-control ${errors.supportEmail ? "is-invalid" : ""}`}
                    value={form.supportEmail}
                    onChange={(e) => onChange("supportEmail", e.target.value)}
                    placeholder="support@university.edu"
                    type="email"
                    disabled={!isEditing}
                    maxLength={120}
                  />
                  {errors.supportEmail && (
                    <div className="invalid-feedback">{errors.supportEmail}</div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label">Site Description</label>
                  <input
                    className={`form-control ${errors.siteDescription ? "is-invalid" : ""}`}
                    value={form.siteDescription}
                    onChange={(e) => onChange("siteDescription", e.target.value)}
                    placeholder="Your AI-powered campus assistant"
                    disabled={!isEditing}
                    maxLength={250}
                  />
                  {errors.siteDescription && (
                    <div className="invalid-feedback">
                      {errors.siteDescription}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">School Phone Number</label>
                  <input
                    className={`form-control ${errors.schoolPhoneNumber ? "is-invalid" : ""}`}
                    value={form.schoolPhoneNumber}
                    onChange={(e) =>
                      onChange("schoolPhoneNumber", e.target.value)
                    }
                    placeholder="+63 912 345 6789"
                    type="text"
                    disabled={!isEditing}
                    maxLength={20}
                  />
                  {errors.schoolPhoneNumber && (
                    <div className="invalid-feedback">
                      {errors.schoolPhoneNumber}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">School Location</label>
                  <input
                    className={`form-control ${errors.schoolLocation ? "is-invalid" : ""}`}
                    value={form.schoolLocation}
                    onChange={(e) => onChange("schoolLocation", e.target.value)}
                    placeholder="Cebu City, Philippines"
                    type="text"
                    disabled={!isEditing}
                    maxLength={150}
                  />
                  {errors.schoolLocation && (
                    <div className="invalid-feedback">
                      {errors.schoolLocation}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 d-flex flex-wrap gap-2">
                {!isEditing ? (
                  <button
                    className="btn btn-primary superadmin-settings-savebtn"
                    onClick={handleEdit}
                  >
                    <Pencil size={18} className="me-2" />
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-primary superadmin-settings-savebtn"
                      onClick={handleAskSave}
                      disabled={saving || hasErrors || isUnchanged}
                    >
                      <Save size={18} className="me-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      className="btn btn-light border"
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      <Ban size={18} className="me-2" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {confirmOpen && (
        <div
          className="superadmin-settings-confirm-backdrop"
          onClick={handleCloseConfirm}
        >
          <div
            className="superadmin-settings-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="superadmin-settings-confirm-close"
              onClick={handleCloseConfirm}
              disabled={saving}
            >
              <X size={18} />
            </button>

            <div className="superadmin-settings-confirm-icon">
              <TriangleAlert size={22} />
            </div>

            <h5 className="fw-bold mb-2 text-center">Confirm Save</h5>

            <p className="text-muted text-center mb-0">
              Are you sure you want to save the changes to general settings?
            </p>

            <div className="superadmin-settings-confirm-actions">
              <button
                type="button"
                className="btn btn-light border"
                onClick={handleCloseConfirm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={onConfirmSave}
                disabled={saving || hasErrors}
              >
                <Save size={16} />
                {saving ? "Saving..." : "Yes, Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}