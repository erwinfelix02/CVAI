import { User, Shield, SlidersHorizontal } from "lucide-react";

export type FacultySettingsTabKey = "account" | "security" | "preferences";

type Props = {
  active: FacultySettingsTabKey;
  setActive: (k: FacultySettingsTabKey) => void;
};

const tabs: { key: FacultySettingsTabKey; label: string; icon: any }[] = [
  { key: "account", label: "Account", icon: User },
  { key: "security", label: "Security", icon: Shield },
  { key: "preferences", label: "Preferences", icon: SlidersHorizontal },
];

export default function FacultySettingsTabs({ active, setActive }: Props) {
  return (
    <div className="faculty-settings-tabs">
      {tabs.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            className={`faculty-settings-tab ${isActive ? "active" : ""}`}
            onClick={() => setActive(key)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
