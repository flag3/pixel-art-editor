import { Icon } from "@iconify/react";

export const createIconComponent = (icon: string) => {
  const IconComponent = () => <Icon icon={icon} width={16} height={16} />;
  return IconComponent;
};
