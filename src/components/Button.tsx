import { Icon } from "@iconify/react";
import type { ButtonProps } from "../types";

export const Button = ({ icon, onClick, disabled = false }: ButtonProps) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      <Icon icon={icon} />
    </button>
  );
};
