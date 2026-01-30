import { ArrowLeft, Plus } from "lucide-react";

type Props = {
  roleName: string;
  count: number;
  onBack: () => void;
  onAdd: () => void;
};

export default function RoleDetailsHeader({ roleName, count, onBack, onAdd }: Props) {
  return (
    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-3">
      <div className="d-flex align-items-center gap-2">
        <button className="btn btn-outline-secondary" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>

        <div className="min-w-0">
          <div className="h5 fw-bold mb-0 text-truncate">{roleName}</div>
          <div className="text-muted small">{count} users • View / Edit / Disable</div>
        </div>
      </div>

      <button className="btn btn-primary d-flex align-items-center gap-2" onClick={onAdd}>
        <Plus size={18} />
        Add User
      </button>
    </div>
  );
}
