import { Anchor, Button, ButtonProps } from "@mantine/core";

export interface AnchorButtonProps extends ButtonProps {
  href: string;
}

/**
 * 外部への遷移を提供するボタン
 */
export const AnchorButton = (props: AnchorButtonProps) => {
  return <Button component="a" {...props} />;
};
