import type { SelectOption } from "../../types";

interface SelectProps<T = string> {
  value: T;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption<T>[];
}

export const Select = <T extends string = string>({ value, onChange, options }: SelectProps<T>) => {
  return (
    <select value={value} onChange={onChange}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
