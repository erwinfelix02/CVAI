// src/components/SuperAdmin/Knowledge/CategoryHeader.tsx
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onBack: () => void;
  right?: React.ReactNode;
};

export default function CategoryHeader({ title, subtitle, icon: Icon, onBack, right }: Props) {
  return (
    <div className="d-flex align-items-start justify-content-between gap-3">
      <div className="d-flex align-items-start gap-3">
        <button
          className="btn btn-link p-0 superadmin-kb-back"
          onClick={onBack}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="d-flex align-items-start gap-3">
          <div className="superadmin-kb-cathead-ic">
            <Icon size={22} />
          </div>

          <div>
            <h3 className="fw-bold mb-1">{title}</h3>
            <div className="text-muted">{subtitle}</div>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0">{right}</div>
    </div>
  );
}
