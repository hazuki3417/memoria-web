import { SegmentedControl } from "@mantine/core";
import { MODE, UseFormSwitcher } from "./useFormSwitcher";
import React from "react";
import {
  FormSwitcherProvider,
  useFormSwitcherContext,
} from "./FormSwitcherContext";

export interface FormSwitcherProps {
  value: UseFormSwitcher;
  children: React.ReactNode;
}

export const FormSwitcher = (props: FormSwitcherProps) => {
  const { value, children } = props;
  return <FormSwitcherProvider value={value}>{children}</FormSwitcherProvider>;
};

FormSwitcher.SegmentedControl = () => {
  const { state, handler } = useFormSwitcherContext();

  return (
    <SegmentedControl
      size="xs"
      value={state.mode}
      onChange={handler.set}
      data={[
        { label: "一括", value: MODE.TYPE.ALL },
        { label: "個別", value: MODE.TYPE.SINGLE },
      ]}
    />
  );
};

FormSwitcher.All = ({ children }: { children: React.ReactNode }) => {
  const { state } = useFormSwitcherContext();
  return state.mode === MODE.TYPE.ALL ? <>{children}</> : null;
};

FormSwitcher.Single = ({ children }: { children: React.ReactNode }) => {
  const { state } = useFormSwitcherContext();
  return state.mode === MODE.TYPE.SINGLE ? <>{children}</> : null;
};
