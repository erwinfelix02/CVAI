import { Globe, Shield } from "lucide-react";

export type SettingsTabKey =
  | "general"
  | "notifications"
  | "security"
  | "appearance";

type Props = {
  active: SettingsTabKey;
  setActive: (k: SettingsTabKey) => void;
};

const tabs: { key: SettingsTabKey; label: string; icon: any }[] = [
  { key: "general", label: "General", icon: Globe },
  { key: "security", label: "Security", icon: Shield },
];

export default function SettingsTabs({ active, setActive }: Props) {
  return (
    <div className="superadmin-settings-tabs">
      {tabs.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            className={`superadmin-settings-tab ${isActive ? "active" : ""}`}
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
