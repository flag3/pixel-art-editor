import { createIconComponent } from "./icon";
import { IconButton } from "@primer/react";
import { useMemo } from "react";

interface ButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button = ({ icon, label, onClick, disabled = false }: ButtonProps) => {
  const IconComponent = useMemo(() => createIconComponent(icon), [icon]);

  return (
    <IconButton icon={IconComponent} aria-label={label} onClick={onClick} disabled={disabled} />
  );
};
