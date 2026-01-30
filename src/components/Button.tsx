import type { ButtonProps } from "../types";

export const Button = ({ text, onClick, disabled = false }: ButtonProps) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      <span className="material-icons-outlined">{text}</span>
    </button>
  );
};
