import { useEffect, useState } from "react";
import { Save } from "lucide-react";
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

  const onChange = (k: keyof GeneralSettingsDTO, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
  };

  const onSave = async () => {
    try {
      setSaving(true);
      await updateGeneralSettings(form);
      show("General settings saved!", "success");
    } catch (err: any) {
      show(err?.message || "Failed to save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AuthAlert message={alertMessage} type={alertType} visible={showAlert} loading={saving} />

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
                  onClick={onSave}
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
    </>
  );
}