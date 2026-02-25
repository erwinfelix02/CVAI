type Props = {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export default function SwitchField({
  id,
  label,
  description,
  checked,
  onChange,
  disabled,
}: Props) {
  return (
    <div className="d-flex align-items-start justify-content-between gap-3">
      <div className="min-w-0">
        <div className="rs-label">{label}</div>
        {description ? <div className="rs-help">{description}</div> : null}
      </div>

      <div className="form-check form-switch rs-switch m-0">
        <input
          id={id}
          className="form-check-input"
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          role="switch"
        />
      </div>
    </div>
  );
}