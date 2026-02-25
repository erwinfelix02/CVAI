type Option = { label: string; value: string };

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
};

export default function SelectField({ id, label, value, onChange, options }: Props) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label rs-label">
        {label}
      </label>
      <select
        id={id}
        className="form-select rs-form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}