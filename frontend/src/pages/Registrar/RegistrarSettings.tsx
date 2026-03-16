import { useEffect, useMemo, useState } from "react";
import "../../styles/registrar-settings.css";

import SettingsSectionCard from "../../components/Registrar/settings/SettingsSectionCard";
import SelectField from "../../components/Registrar/settings/fields/SelectField";
import NumberField from "../../components/Registrar/settings/fields/NumberField";
import SwitchField from "../../components/Registrar/settings/fields/SwitchField";
import AuthAlert from "../../components/Authentication/AuthAlert";

import {
  Calendar,
  RefreshCw,
  FileText,
  Settings,
  TriangleAlert,
  X,
} from "lucide-react";

type FormState = {
  academicYear: string;
  semester: string;
  enrollmentOpen: boolean;
  maxStudentsPerSection: number;
  processingDays: number;
  autoApproveSimpleDocs: boolean;
};

const API_URL = "http://localhost:5000/api/registrar/settings";

const DEFAULT_FORM: FormState = {
  academicYear: "2023-2024",
  semester: "2nd Semester",
  enrollmentOpen: true,
  maxStudentsPerSection: 45,
  processingDays: 5,
  autoApproveSimpleDocs: false,
};

export default function RegistrarSettings() {
  const yearOptions = useMemo(
    () => [
      { label: "2023-2024", value: "2023-2024" },
      { label: "2024-2025", value: "2024-2025" },
      { label: "2025-2026", value: "2025-2026" },
    ],
    [],
  );

  const semesterOptions = useMemo(
    () => [
      { label: "1st Semester", value: "1st Semester" },
      { label: "2nd Semester", value: "2nd Semester" },
      { label: "Summer", value: "Summer" },
    ],
    [],
  );

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [savedForm, setSavedForm] = useState<FormState>(DEFAULT_FORM);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [animateAlert, setAnimateAlert] = useState(false);

  const showAlert = (message: string, type: "success" | "error") => {
    setAnimateAlert(false);
    setTimeout(() => {
      setAlertMessage(message);
      setAlertType(type);
      setAnimateAlert(true);
    }, 50);
  };

  useEffect(() => {
    if (!animateAlert) return;
    const t = setTimeout(() => setAnimateAlert(false), 3000);
    return () => clearTimeout(t);
  }, [animateAlert]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    if (!isEditing) return;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    let alive = true;

    async function loadSettings() {
      setLoading(true);
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const loaded: FormState = {
          academicYear: data.academicYear ?? DEFAULT_FORM.academicYear,
          semester: data.semester ?? DEFAULT_FORM.semester,
          enrollmentOpen: !!data.enrollmentOpen,
          maxStudentsPerSection: Number(
            data.maxStudentsPerSection ?? DEFAULT_FORM.maxStudentsPerSection,
          ),
          processingDays: Number(
            data.processingDays ?? DEFAULT_FORM.processingDays,
          ),
          autoApproveSimpleDocs: !!data.autoApproveSimpleDocs,
        };

        if (alive) {
          setForm(loaded);
          setSavedForm(loaded);
        }
      } catch (err) {
        console.error(err);
        if (alive) {
          setForm(DEFAULT_FORM);
          setSavedForm(DEFAULT_FORM);
        }
        showAlert("Server error loading settings", "error");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadSettings();
    return () => {
      alive = false;
    };
  }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      const updated: FormState = {
        academicYear: data.academicYear ?? form.academicYear,
        semester: data.semester ?? form.semester,
        enrollmentOpen: !!data.enrollmentOpen,
        maxStudentsPerSection: Number(
          data.maxStudentsPerSection ?? form.maxStudentsPerSection,
        ),
        processingDays: Number(data.processingDays ?? form.processingDays),
        autoApproveSimpleDocs: !!data.autoApproveSimpleDocs,
      };

      setForm(updated);
      setSavedForm(updated);
      setIsEditing(false);
      setConfirmOpen(false);

      showAlert("Settings saved successfully!", "success");
    } catch (err) {
      console.error(err);
      showAlert("Server error saving settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setForm(savedForm);
    setIsEditing(false);
  };

  const handleAskSave = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setConfirmOpen(true);
  };

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={saving}
      />

      <div className="registrar-settings-page">
        <div className="d-flex align-items-start gap-3 mb-3 mb-md-4">
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "#ffffff",
              border: "1px solid #e9ecef",
              flexShrink: 0,
            }}
          >
            <Settings size={20} />
          </div>

          <div>
            <h2 className="fw-bold mb-1">Registrar Settings</h2>
            <p className="text-muted mb-0">
              Configure enrollment and document processing settings
            </p>
          </div>
        </div>

        {loading && <div className="alert alert-info">Loading settings...</div>}

        <div style={{ pointerEvents: isEditing ? "auto" : "none" }}>
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <SettingsSectionCard
                icon={<Calendar size={20} />}
                title="Academic Period"
                subtitle="Set the current academic term"
              >
                <SelectField
                  id="academicYear"
                  label="Academic Year"
                  value={form.academicYear}
                  onChange={(v) => update("academicYear", v)}
                  options={yearOptions}
                />

                <SelectField
                  id="semester"
                  label="Semester"
                  value={form.semester}
                  onChange={(v) => update("semester", v)}
                  options={semesterOptions}
                />
              </SettingsSectionCard>
            </div>

            <div className="col-12 col-lg-6">
              <SettingsSectionCard
                icon={<RefreshCw size={20} />}
                title="Enrollment Settings"
                subtitle="Manage enrollment configurations"
              >
                <SwitchField
                  id="enrollmentOpen"
                  label="Enrollment Period Open"
                  description="Allow new student enrollments"
                  checked={form.enrollmentOpen}
                  onChange={(v) => update("enrollmentOpen", v)}
                />

                <div className="rs-divider" />

                <NumberField
                  id="maxStudentsPerSection"
                  label="Max Students per Section"
                  value={form.maxStudentsPerSection}
                  min={1}
                  onChange={(v) => update("maxStudentsPerSection", v)}
                />
              </SettingsSectionCard>
            </div>

            <div className="col-12">
              <SettingsSectionCard
                icon={<FileText size={20} />}
                title="Document Processing"
                subtitle="Configure document request settings"
              >
                <div className="row g-3">
                  <div className="col-md-6">
                    <NumberField
                      id="processingDays"
                      label="Processing Days"
                      value={form.processingDays}
                      min={0}
                      onChange={(v) => update("processingDays", v)}
                      helpText="Number of working days to process documents"
                    />
                  </div>

                  <div className="col-md-6">
                    <SwitchField
                      id="autoApproveSimpleDocs"
                      label="Auto-approve Simple Documents"
                      description="Certificates of enrollment, etc."
                      checked={form.autoApproveSimpleDocs}
                      onChange={(v) => update("autoApproveSimpleDocs", v)}
                    />
                  </div>
                </div>
              </SettingsSectionCard>
            </div>
          </div>
        </div>

        <div className="rs-savebar mt-4">
          <div className="py-3 d-flex justify-content-end gap-2">
            {isEditing && (
              <button
                className="btn btn-outline-secondary btn-lg"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}

            <button
              className="btn btn-lg px-4 rs-save-btn"
              onClick={handleAskSave}
            >
              {!isEditing ? "Edit" : saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <div
          className="registrar-settings-confirm-backdrop"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="registrar-settings-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="registrar-settings-confirm-close"
              onClick={() => setConfirmOpen(false)}
            >
              <X size={18} />
            </button>

            <div className="registrar-settings-confirm-icon">
              <TriangleAlert size={22} />
            </div>

            <h5 className="fw-bold text-center">Confirm Save</h5>

            <p className="text-muted text-center">
              Are you sure you want to save the changes?
            </p>

            <div className="registrar-settings-confirm-actions">
              <button
                className="btn btn-light border"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>

              <button className="btn btn-primary" onClick={onSave}>
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}