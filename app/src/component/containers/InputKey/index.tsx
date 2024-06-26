import {
	FieldValues,
	useController,
	UseControllerProps,
} from "react-hook-form";
import Origin, {
	InputKeyProps as OriginProps,
} from "@/component/presentations/InputKey";

type Props<T extends FieldValues> = OriginProps & UseControllerProps<T>;

const InputKey = <T extends FieldValues>(props: Props<T>) => {
	const { name, control } = props;
	const { fieldState } = useController<T>({ name, control });
	return <Origin {...props} {...fieldState} />;
};

export default InputKey;
export type InputKeyProps = React.ComponentProps<typeof InputKey>;
