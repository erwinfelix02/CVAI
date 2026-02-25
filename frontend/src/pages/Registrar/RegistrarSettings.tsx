import { useEffect, useMemo, useState } from "react";
import "../../styles/registrar-settings.css";

import SettingsSectionCard from "../../components/Registrar/settings/SettingsSectionCard";
import SelectField from "../../components/Registrar/settings/fields/SelectField";
import NumberField from "../../components/Registrar/settings/fields/NumberField";
import SwitchField from "../../components/Registrar/settings/fields/SwitchField";
import AuthAlert from "../../components/Authentication/AuthAlert";

import { Calendar, RefreshCw, FileText, Bell, Settings } from "lucide-react";

type FormState = {
  academicYear: string;
  semester: string;

  enrollmentOpen: boolean;
  maxStudentsPerSection: number;

  processingDays: number;
  autoApproveSimpleDocs: boolean;

  emailNotifications: boolean;
  smsNotifications: boolean;
};

const API_URL = "http://localhost:5000/api/registrar/settings";

const DEFAULT_FORM: FormState = {
  academicYear: "2023-2024",
  semester: "2nd Semester",

  enrollmentOpen: true,
  maxStudentsPerSection: 45,

  processingDays: 5,
  autoApproveSimpleDocs: false,

  emailNotifications: true,
  smsNotifications: false,
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
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ AuthAlert state (same pattern as UsersPage)
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
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ Load settings from DB on page open
  useEffect(() => {
    let alive = true;

    async function loadSettings() {
      setLoading(true);
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        if (!res.ok) {
          console.error("Failed to load settings:", data);
          if (alive) setForm(DEFAULT_FORM);
          showAlert(data?.message || "Failed to load settings", "error");
          return;
        }

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

          emailNotifications: !!data.emailNotifications,
          smsNotifications: !!data.smsNotifications,
        };

        if (alive) setForm(loaded);
      } catch (err) {
        console.error("Failed to load registrar settings", err);
        if (alive) setForm(DEFAULT_FORM);
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

  // ✅ Save settings to DB + show AuthAlert
  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        showAlert(data?.message || "Failed to save settings", "error");
        return;
      }

      // ✅ Update form with DB result (source of truth)
      setForm({
        academicYear: data.academicYear ?? form.academicYear,
        semester: data.semester ?? form.semester,
        enrollmentOpen: !!data.enrollmentOpen,
        maxStudentsPerSection: Number(
          data.maxStudentsPerSection ?? form.maxStudentsPerSection,
        ),
        processingDays: Number(data.processingDays ?? form.processingDays),
        autoApproveSimpleDocs: !!data.autoApproveSimpleDocs,
        emailNotifications: !!data.emailNotifications,
        smsNotifications: !!data.smsNotifications,
      });

      showAlert("Settings saved successfully!", "success");
    } catch (err) {
      console.error(err);
      showAlert("Server error saving settings", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={saving}
      />

      <div className="rs-page py-4 py-md-5">
        <div className="container">
          {/* Header */}
          <div className="d-flex align-items-start gap-3 mb-4">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "#ffffff",
                border: "1px solid #e9ecef",
              }}
              aria-hidden="true"
            >
              <Settings size={20} />
            </div>

            <div className="min-w-0">
              <h1 className="rs-page-title h3 mb-1">Registrar Settings</h1>
              <div className="rs-subtitle">
                Configure enrollment and document processing settings
              </div>
            </div>
          </div>

          {/* Loading message */}
          {loading ? (
            <div className="alert alert-info">Loading settings...</div>
          ) : null}

          {/* Grid */}
          <div className="row g-4">
            {/* Academic Period */}
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

            {/* Enrollment Settings */}
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

            {/* Document Processing */}
            <div className="col-12 col-lg-6">
              <SettingsSectionCard
                icon={<FileText size={20} />}
                title="Document Processing"
                subtitle="Configure document request settings"
              >
                <NumberField
                  id="processingDays"
                  label="Processing Days"
                  value={form.processingDays}
                  min={0}
                  onChange={(v) => update("processingDays", v)}
                  helpText="Number of working days to process documents"
                />

                <div className="rs-divider" />

                <SwitchField
                  id="autoApproveSimpleDocs"
                  label="Auto-approve Simple Documents"
                  description="Certificates of enrollment, etc."
                  checked={form.autoApproveSimpleDocs}
                  onChange={(v) => update("autoApproveSimpleDocs", v)}
                />
              </SettingsSectionCard>
            </div>

            {/* Notifications */}
            <div className="col-12 col-lg-6">
              <SettingsSectionCard
                icon={<Bell size={20} />}
                title="Notifications"
                subtitle="Manage notification preferences"
              >
                <SwitchField
                  id="emailNotifications"
                  label="Email Notifications"
                  description="Send email updates to students"
                  checked={form.emailNotifications}
                  onChange={(v) => update("emailNotifications", v)}
                />

                <div className="rs-divider" />

                <SwitchField
                  id="smsNotifications"
                  label="SMS Notifications"
                  description="Send SMS for urgent updates"
                  checked={form.smsNotifications}
                  onChange={(v) => update("smsNotifications", v)}
                />
              </SettingsSectionCard>
            </div>
          </div>
        </div>

        {/* Sticky Save Bar */}
        <div className="rs-savebar mt-4">
          <div className="container py-3 d-flex justify-content-end gap-2">
            <button
              className="btn btn-outline-secondary btn-lg"
              onClick={() => setForm(DEFAULT_FORM)}
              disabled={saving || loading}
            >
              Reset
            </button>

            <button
              className="btn btn-lg px-4 rs-save-btn"
              onClick={onSave}
              disabled={saving || loading}
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
