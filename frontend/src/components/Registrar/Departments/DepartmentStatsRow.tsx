import { Building2, CheckCircle2, XCircle } from "lucide-react";

type Props = {
  total: number;
  active: number;
  inactive: number;
};

export default function DepartmentStatsRow({ total, active, inactive }: Props) {
  return (
    <div className="sad-stats">
      <div className="sad-stat-card">
        <div className="sad-stat-icon sad-stat-icon-blue">
          <Building2 size={20} />
        </div>
        <div>
          <div className="sad-stat-num">{total}</div>
          <div className="sad-stat-label">Total Departments</div>
        </div>
      </div>

      <div className="sad-stat-card">
        <div className="sad-stat-icon sad-stat-icon-green">
          <CheckCircle2 size={20} />
        </div>
        <div>
          <div className="sad-stat-num">{active}</div>
          <div className="sad-stat-label">Active</div>
        </div>
      </div>

      <div className="sad-stat-card">
        <div className="sad-stat-icon sad-stat-icon-red">
          <XCircle size={20} />
        </div>
        <div>
          <div className="sad-stat-num">{inactive}</div>
          <div className="sad-stat-label">Inactive</div>
        </div>
      </div>
    </div>
  );
}
