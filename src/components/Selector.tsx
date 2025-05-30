import { SelectorProps } from "../types";

export const Selector = <T extends string = string>({
  className,
  label,
  value,
  onChange,
  options,
}: SelectorProps<T>) => {
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
