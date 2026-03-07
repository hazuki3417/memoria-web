import { FieldValid } from "@/components"
import { Box, BoxProps, List, Stack } from "@mantine/core"
import { IconPhotoPlus } from "@tabler/icons-react"
import React, { useRef } from "react"
import classes from "./AddImageBox.module.css"

export type AddImageBoxPayload = {
  count: {
    max: number
  }
  size: {
    max: number
  }
  accept?: string
  type?: string[]
}

export type AddImageBoxUi = {
  valid?: FieldValid
}

export interface AddImageBoxProps
  extends Omit<BoxProps, "className" | "style" | "onClick"> {
  payload: AddImageBoxPayload
  onFileSelect?: (files: FileList | null) => void
  ui?: AddImageBoxUi
  disabled?: boolean
}

export const AddImageBox = (props: AddImageBoxProps) => {
  const { payload, ui, onFileSelect, disabled = false, ...rest } = props
  const { valid = "idle" } = ui ?? {}
  const { count, size, accept = "image/*", type = ["jpeg", "png"] } = payload
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (disabled) {
      return
    }

    if (valid === "reject") {
      return
    }

    // 間接的にinput type="file"のclickイベントを発火させる
    inputRef.current?.click()
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return
    }
    onFileSelect?.(event.target.files)
  }

  return (
    <Box
      h={"160px"}
      w={"160px"}
      className={classes.box}
      onClick={handleClick}
      data-valid={valid}
      data-disabled={disabled}
      {...rest}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <Stack
        gap={8}
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <IconPhotoPlus size={40} />
        <List size="xs">
          <List.Item>{type.join(" / ")}</List.Item>
          <List.Item>{`${size.max} / 1件`}</List.Item>
          <List.Item>{`最大 ${count.max} 件`}</List.Item>
        </List>
      </Stack>
    </Box>
  )
}
