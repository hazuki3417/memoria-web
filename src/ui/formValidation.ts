/** Presentation mapping for public input violations, independent of GraphQL transport. */
export type FormInputViolation = {
  scope: string
  code: string
  inputPaths: ReadonlyArray<{ segments: ReadonlyArray<string> }>
}

export type FormValidationResult = {
  fieldErrors: Record<string, string>
  formError: boolean
}

const validationMessages: Record<string, string> = {
  REQUIRED: "必須項目です。",
  INVALID_FORMAT: "入力形式を確認してください。",
  INVALID_VALUE: "入力内容を確認してください。",
  TOO_LONG: "文字数が上限を超えています。",
  OUT_OF_RANGE: "指定された範囲内で入力してください。",
  INVALID_COMBINATION: "入力内容の組み合わせを確認してください。",
}

/**
 * API input paths are relative to mutation input, not GraphQL errors[].path.
 * Unknown codes, paths and scopes must not create invented field errors.
 */
export function resolveFormInputValidation(
  error: { violations: ReadonlyArray<FormInputViolation> },
  fieldNames: readonly string[],
): FormValidationResult {
  const fieldErrors: Record<string, string> = {}
  let formError = false
  for (const violation of error.violations) {
    const field =
      violation.scope === "FIELD" &&
      violation.inputPaths.length === 1 &&
      violation.inputPaths[0]?.segments.length === 1
        ? violation.inputPaths[0]?.segments[0]
        : undefined
    const message = validationMessages[violation.code]
    if (field && fieldNames.includes(field) && message) {
      fieldErrors[field] = message
    } else {
      formError = true
    }
  }
  if (error.violations.length === 0) formError = true
  return { fieldErrors, formError }
}

/** Without a typed input rejection, a GraphQL VALIDATION/CONFLICT has no field paths. */
export function resolveFormFailureValidation(
  violations: ReadonlyArray<FormInputViolation> | null,
  fields: readonly string[],
): FormValidationResult {
  return violations !== null
    ? resolveFormInputValidation({ violations }, fields)
    : { fieldErrors: {}, formError: true }
}
