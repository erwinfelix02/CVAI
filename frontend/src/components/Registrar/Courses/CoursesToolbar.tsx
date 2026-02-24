import { Search } from "lucide-react";

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
};

export default function CoursesToolbar({ query, onQueryChange }: Props) {
  return (
    <div className="courses-toolbar d-flex justify-content-end">
      <div className="courses-search">
        <Search size={18} className="courses-search-icon" />
        <input
          className="form-control courses-search-input"
          placeholder="Search courses..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
    </div>
  );
}