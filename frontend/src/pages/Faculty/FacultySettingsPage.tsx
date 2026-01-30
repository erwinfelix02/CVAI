import { useMemo, useState } from "react";
import FacultySettingsHeader from "../../components/Faculty/Settings/FacultySettingsHeader";
import FacultySettingsTabs from "../../components/Faculty/Settings/FacultySettingsTabs";
import type { FacultySettingsTabKey } from "../../components/Faculty/Settings/FacultySettingsTabs";

import FacultyAccountSettings from "../../components/Faculty/Settings/FacultyAccountSettings";
import FacultySecuritySettings from "../../components/Faculty/Settings/FacultySecuritySettings";
import FacultyPreferencesSettings from "../../components/Faculty/Settings/FacultyPreferencesSettings";

import "../../styles/faculty-settings.css";

export default function FacultySettingsPage() {
  const [active, setActive] = useState<FacultySettingsTabKey>("account");

  const content = useMemo(() => {
    switch (active) {
      case "account":
        return <FacultyAccountSettings />;
      case "security":
        return <FacultySecuritySettings />;
      case "preferences":
        return <FacultyPreferencesSettings />;
      default:
        return null;
    }
  }, [active]);

  return (
    <div className="faculty-settings container-fluid py-4">
      <FacultySettingsHeader />

      <div className="faculty-settings-tabswrap">
        <FacultySettingsTabs active={active} setActive={setActive} />
      </div>

      <div className="mt-3 mt-md-4">{content}</div>
    </div>
  );
}
