import { Icon } from "@iconify/react";

interface ButtonProps {
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button = ({ icon, onClick, disabled = false }: ButtonProps) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      <Icon icon={icon} />
    </button>
  );
};
