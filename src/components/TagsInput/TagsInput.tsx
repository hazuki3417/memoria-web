import {
  TagsInput as BaseInput,
  TagsInputProps as BaseProps,
  Box,
  Flex,
  InputDescription,
  InputError,
  InputLabel,
  InputWrapper,
  InputWrapperProps,
} from "@mantine/core"
import React from "react"
import { InputCounter } from "../InputCounter"

export interface TagsInputProps
  extends Pick<InputWrapperProps, "label" | "description" | "error" | "size">,
    BaseProps {
  current: number
  limit: number
}

export const TagsInput = React.forwardRef<HTMLInputElement, TagsInputProps>(
  (props, ref) => {
    const { size, label, description, error, styles, current, limit, ...rest } =
      props

    return (
      <InputWrapper
        size={size}
        style={{
          display: "flex",
          flexDirection: "column",
        }}
        styles={{ ...styles }}
      >
        <Flex justify="space-between" align="end">
          <Box flex="1">
            {label && <InputLabel styles={{ ...styles }}>{label}</InputLabel>}
            {description && (
              <InputDescription styles={{ ...styles }}>
                {description}
              </InputDescription>
            )}
          </Box>
          <InputCounter size={size} current={current} limit={limit} />
        </Flex>
        <BaseInput
          ref={ref}
          size={size}
          error={error ? true : false}
          styles={{ ...styles }}
          {...rest}
        />
        {error && <InputError styles={{ ...styles }}>{error}</InputError>}
      </InputWrapper>
    )
  },
)
