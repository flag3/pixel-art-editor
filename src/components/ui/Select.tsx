import type { SelectOption } from "../../types";
import { Select as PrimerSelect, useFormControlForwardedProps } from "@primer/react";

interface SelectProps<T = string> {
  id?: string;
  value: T;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption<T>[];
}

export const Select = <T extends string = string>(props: SelectProps<T>) => {
  const { value, onChange, options, ...forwardedProps } = useFormControlForwardedProps(props);

  return (
    <PrimerSelect {...forwardedProps} value={value} onChange={onChange}>
      {options.map((option) => (
        <PrimerSelect.Option key={option.value} value={option.value}>
          {option.label}
        </PrimerSelect.Option>
      ))}
    </PrimerSelect>
  );
};
