export interface FormDataViewProps {
  formData: Record<string, any>;
}

export const FormDataView = (props: FormDataViewProps) => {
  const { formData } = props;
  return <pre>{JSON.stringify(formData, null, 2)}</pre>;
};
