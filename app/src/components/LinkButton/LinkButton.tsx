import Link from "next/link";
import { Button, ButtonProps } from "@mantine/core";

export interface LinkButtonProps extends ButtonProps {
  href: string;
}

export const LinkButton = (props: LinkButtonProps) => {
  return <Button component={Link} {...props} />;
};
