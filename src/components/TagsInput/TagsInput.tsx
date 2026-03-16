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
    BaseProps {}

export const TagsInput = React.forwardRef<HTMLInputElement, TagsInputProps>(
  (props, ref) => {
    const { size, label, description, error, styles, ...rest } = props

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
          <InputCounter size={size} limit={30} current={0} />
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
