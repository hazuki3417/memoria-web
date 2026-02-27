import { useFormContext } from "./FormContext"

export interface FormGroupProps {
  children: React.ReactNode
  onSubmit?: React.FormEventHandler<HTMLFormElement>
}

export const FormGroup = (props: FormGroupProps) => {
  const { children, onSubmit } = props
  const { formId } = useFormContext()
  return (
    <form id={formId} onSubmit={onSubmit}>
      {children}
    </form>
  )
}
