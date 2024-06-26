import { ComponentProps } from "react";
import {
	FieldValues,
	useController,
	UseControllerProps,
} from "react-hook-form";
import {
	Form,
	FormItemProps,
	Input as Origin,
	InputProps as OriginProps,
} from "antd";

type UseFormItemProps = Pick<FormItemProps, "label" | "layout" | "required">;
type UseInputProps = OriginProps;

type Props<T extends FieldValues> = UseControllerProps<T> &
	UseFormItemProps &
	UseInputProps & {
		// NOTE: 必要に応じて追加
	};

/**
 * react-hook-formのuseControllerとantdのForm.Itemを組み合わせたInputコンポーネント
 */
const Input = <T extends FieldValues>(props: Props<T>) => {
	const { label, layout, required, name, control, ...leter } = props;
	const { field, fieldState } = useController<T>({ name, control });

	return (
		<Form.Item
			label={label}
			layout={layout}
			required={required}
			validateStatus={fieldState.invalid ? "error" : ""}
			help={fieldState.error?.message}
		>
			<Origin {...leter} {...field} {...fieldState} />
		</Form.Item>
	);
};

export default Input;
export type InputProps = ComponentProps<typeof Input>;
