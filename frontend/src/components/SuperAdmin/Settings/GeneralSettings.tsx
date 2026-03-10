import { useEffect, useState } from "react";
import { Save, TriangleAlert, X } from "lucide-react";
import AuthAlert from "../../Authentication/AuthAlert";
import {
  getGeneralSettings,
  updateGeneralSettings,
  type GeneralSettingsDTO,
} from "../../../api/settingsService";

export default function GeneralSettings() {
  const [form, setForm] = useState<GeneralSettingsDTO>({
    siteName: "",
    supportEmail: "",
    siteDescription: "",
    aiWelcomeMessage: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [showAlert, setShowAlert] = useState(false);

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
    setForm((p) => ({ ...p, [k]: v }));
  };

  const handleAskSave = () => {
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    if (saving) return;
    setConfirmOpen(false);
  };

  const onConfirmSave = async () => {
    try {
      setSaving(true);
      await updateGeneralSettings(form);
      setConfirmOpen(false);
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
                    className="form-control"
                    value={form.siteName}
                    onChange={(e) => onChange("siteName", e.target.value)}
                    placeholder="Enter site name"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Support Email</label>
                  <input
                    className="form-control"
                    value={form.supportEmail}
                    onChange={(e) => onChange("supportEmail", e.target.value)}
                    placeholder="support@university.edu"
                    type="email"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Site Description</label>
                  <input
                    className="form-control"
                    value={form.siteDescription}
                    onChange={(e) => onChange("siteDescription", e.target.value)}
                    placeholder="Your AI-powered campus assistant"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">AI Welcome Message</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={form.aiWelcomeMessage}
                    onChange={(e) => onChange("aiWelcomeMessage", e.target.value)}
                  />
                  <div className="form-text">
                    This message will be displayed when users first open the chatbot
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  className="btn btn-primary superadmin-settings-savebtn"
                  onClick={handleAskSave}
                  disabled={saving}
                >
                  <Save size={18} className="me-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
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
                disabled={saving}
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