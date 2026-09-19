import { useMemo, useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import SettingsHeader from "../../components/SuperAdmin/Settings/SettingsHeader";
import SettingsTabs from "../../components/SuperAdmin/Settings/SettingsTabs";
import type { SettingsTabKey } from "../../components/SuperAdmin/Settings/SettingsTabs";
import GeneralSettings from "../../components/SuperAdmin/Settings/GeneralSettings";
import SecuritySettings from "../../components/SuperAdmin/Settings/SecuritySettings";

import "../../styles/superadmin-settings.css";

function FeatureUnavailable({
  title,
  icon,
}: {
  title: string;
  icon: string;
}) {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4 p-md-5 text-center">
        <div className="mb-3" style={{ fontSize: "2rem" }}>
          {icon}
        </div>

        <h4 className="fw-bold mb-2">{title} not available right now</h4>

        <p className="text-muted mb-0">
          This section is still under development and will be added in a future update.
        </p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState<SettingsTabKey>("general");
  const [isDirty, setIsDirty] = useState(false);
  const [pendingTab, setPendingTab] = useState<SettingsTabKey | null>(null);

  // Intercept tab changes if active form has unsaved changes
  const handleTabChange = (nextTab: SettingsTabKey) => {
    if (nextTab === active) return;

    if (isDirty) {
      setPendingTab(nextTab);
    } else {
      setActive(nextTab);
    }
  };

  const confirmDiscardTabChange = () => {
    if (pendingTab) {
      setActive(pendingTab);
      setPendingTab(null);
      setIsDirty(false);
    }
  };

  const cancelDiscardTabChange = () => {
    setPendingTab(null);
  };

  // Keyboard Escape listener for discard tab modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && pendingTab) {
        setPendingTab(null);
      }
    };

    if (pendingTab) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pendingTab]);

  const content = useMemo(() => {
    switch (active) {
      case "general":
        return <GeneralSettings onDirtyChange={setIsDirty} />;

      case "notifications":
        return (
          <FeatureUnavailable
            title="Notifications"
            icon="🔔"
          />
        );

      case "security":
        return <SecuritySettings onDirtyChange={setIsDirty} />;

      case "appearance":
        return (
          <FeatureUnavailable
            title="Appearance"
            icon="🎨"
          />
        );

      default:
        return null;
    }
  }, [active]);

  return (
    <div className="superadmin-settings">
      <SettingsHeader />

      <div className="superadmin-settings-tabswrap">
        <SettingsTabs active={active} setActive={handleTabChange} />
      </div>

      <div className="mt-3 mt-md-4">{content}</div>

      {/* DISCARD CHANGES BEFORE SWITCHING TABS MODAL */}
      {pendingTab && (
        <div
          className="superadmin-settings-confirm-backdrop"
          onClick={cancelDiscardTabChange}
        >
          <div
            className="superadmin-settings-confirm-modal"
            style={{ maxWidth: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="superadmin-settings-confirm-close"
              onClick={cancelDiscardTabChange}
            >
              <X size={18} />
            </button>

            <div className="superadmin-settings-confirm-icon bg-warning-subtle text-warning">
              <AlertTriangle size={22} />
            </div>

            <h5 className="fw-bold mb-2 text-center">Discard changes?</h5>

            <p className="text-muted text-center mb-0">
              You have unsaved edits in {active} settings. Switching tabs will discard your changes.
            </p>

            <div className="superadmin-settings-confirm-actions mt-3">
              <button
                type="button"
                className="btn btn-light border"
                onClick={cancelDiscardTabChange}
              >
                Keep Editing
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDiscardTabChange}
              >
                Discard & Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}