// src/components/SuperAdmin/Knowledge/KnowledgeHeader.tsx
import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
};

export default function KnowledgeHeader({ title, subtitle, icon: Icon }: Props) {
  return (
    <div className="d-flex align-items-start gap-2 mb-3">
      <div className="superadmin-kb-titleicon">
        <Icon size={22} />
      </div>

      <div>
        <h2 className="fw-bold mb-1">{title}</h2>
        <p className="text-muted mb-0">{subtitle}</p>
      </div>
    </div>
  );
}
