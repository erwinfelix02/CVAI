// src/components/SuperAdmin/Knowledge/FaqSearch.tsx
import { Search, Filter } from "lucide-react";

type Props = {
  query: string;
  setQuery: (v: string) => void;
  filter: string;
  setFilter: (v: string) => void;
};

export default function FaqSearch({
  query,
  setQuery,
  filter,
  setFilter
}: Props) {
  return (
    <div className="superadmin-kb-search-wrapper">
      <div className="superadmin-kb-search">
        <span className="superadmin-kb-search-ic">
          <Search size={16} />
        </span>
        <input
          className="form-control superadmin-kb-search-input"
          placeholder="Search FAQs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="superadmin-kb-filter">
        <Filter size={16} />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="recent">Recently Updated</option>
          <option value="new">Newly Added</option>
        </select>
      </div>
    </div>
  );
}
