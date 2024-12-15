type SelectorProps = {
  className?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
};

export default function Selector({
  className,
  label,
  value,
  onChange,
  options,
}: SelectorProps) {
  return (
    <div className={className}>
      <label>
        {label}
        <select value={value} onChange={onChange}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
