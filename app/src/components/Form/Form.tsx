import { memo, useId, useMemo } from "react";
import { FormContext } from "./FormContext";
import { FormGroup } from "./FormGroup";
import { FormSubmit } from "./FormSubmit";
import { FormLoadingOverlay } from "./FormLoadingOverlay";
import { FormContainer } from "./FormContainer";

export interface FormProps {
  children: React.ReactNode;
}

export const Form = (props: FormProps) => {
  const { children } = props;
  const formId = useId();
  const value = useMemo(() => ({ formId }), [formId]);
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

Form.Container = memo(FormContainer);
Form.LoadingOverlay = memo(FormLoadingOverlay);
Form.Group = memo(FormGroup);
Form.Submit = memo(FormSubmit);
