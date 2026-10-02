import { Search } from "lucide-react";

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
};

export default function DepartmentsToolbar({ query, onQueryChange }: Props) {
  return (
    <div className="sad-toolbar">
      <div className="sad-search">
        <span className="sad-search-ico">
          <Search size={18} />
        </span>

        <input
          className="form-control sad-search-input"
          placeholder="Search departments..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
    </div>
  );
}