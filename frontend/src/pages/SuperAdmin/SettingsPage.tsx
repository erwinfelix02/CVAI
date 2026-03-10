import { useMemo, useState } from "react";
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

  const content = useMemo(() => {
    switch (active) {
      case "general":
        return <GeneralSettings />;

      case "notifications":
        return (
          <FeatureUnavailable
            title="Notifications"
            icon="🔔"
          />
        );

      case "security":
        return <SecuritySettings />;

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
        <SettingsTabs active={active} setActive={setActive} />
      </div>

      <div className="mt-3 mt-md-4">{content}</div>
    </div>
  );
}