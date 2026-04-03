import type { TextareaProps } from "../../types";

export const Textarea = ({ value, onChange, rows, cols }: TextareaProps) => {
  return <textarea value={value} onChange={onChange} rows={rows} cols={cols} />;
};
