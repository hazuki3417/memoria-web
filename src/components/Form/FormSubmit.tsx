import { useFormContext } from "./FormContext"

export interface FormSubmitProps {
  button: (props: { type: "submit"; form: string }) => React.ReactNode
}

export const FormSubmit = (props: FormSubmitProps) => {
  const { button } = props
  const { formId } = useFormContext()
  return <>{button({ type: "submit", form: formId })}</>
}
