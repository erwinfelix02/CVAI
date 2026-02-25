type Props = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  helpText?: string;
};

export default function NumberField({ id, label, value, onChange, min, helpText }: Props) {
  return (
    <div className="mb-2">
      <label htmlFor={id} className="form-label rs-label">
        {label}
      </label>
      <input
        id={id}
        type="number"
        className="form-control rs-form-control"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      />
      {helpText ? <div className="rs-help mt-2">{helpText}</div> : null}
    </div>
  );
}