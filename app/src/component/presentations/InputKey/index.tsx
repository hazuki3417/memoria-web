import { ComponentProps, ComponentPropsWithoutRef, forwardRef } from "react";

type Props = Omit<ComponentPropsWithoutRef<"input">, "type" | "children"> & {
	// NOTE: 必要に応じて拡張
};

/**
 * formのキーを保持するコンポーネント
 */
const InputKey = forwardRef<HTMLInputElement, Props>(({ ...props }, ref) => (
	<input type="hedden" ref={ref} {...props} />
));

export default InputKey;
export type InputKeyProps = ComponentProps<typeof InputKey>;
