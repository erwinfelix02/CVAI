import { useMemo, useState } from "react";
import SettingsHeader from "../../components/SuperAdmin/Settings/SettingsHeader";
import SettingsTabs from "../../components/SuperAdmin/Settings/SettingsTabs";
import type { SettingsTabKey } from "../../components/SuperAdmin/Settings/SettingsTabs";
import GeneralSettings from "../../components/SuperAdmin/Settings/GeneralSettings";
import NotificationSettings from "../../components/SuperAdmin/Settings/NotificationSettings";
import SecuritySettings from "../../components/SuperAdmin/Settings/SecuritySettings";
import AppearanceSettings from "../../components/SuperAdmin/Settings/AppearanceSettings";

import "../../styles/superadmin-settings.css";

export default function SettingsPage() {
  const [active, setActive] = useState<SettingsTabKey>("general");

  const content = useMemo(() => {
    switch (active) {
      case "general":
        return <GeneralSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "security":
        return <SecuritySettings />;
      case "appearance":
        return <AppearanceSettings />;
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
