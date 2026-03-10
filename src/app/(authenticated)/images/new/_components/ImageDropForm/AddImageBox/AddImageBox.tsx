import { FieldValid } from "@/components"
import {
  DEFAULT_FILE_SIZE_PREFIX,
  FileSizePrefix,
  transform,
} from "@/lib/transform"
import { Box, BoxProps, List, Stack } from "@mantine/core"
import { IconPhotoPlus } from "@tabler/icons-react"
import React, { useRef } from "react"
import classes from "./AddImageBox.module.css"

export type AddImageBoxPayload = {
  count?: number
  size?: number
  accept?: string
  type?: string[]
}

export type AddImageBoxUi = {
  valid?: FieldValid
}

export interface AddImageBoxProps
  extends Omit<BoxProps, "className" | "style" | "onClick"> {
  payload: AddImageBoxPayload
  prefix?: FileSizePrefix
  onFileSelect?: (files: FileList | null) => void
  ui?: AddImageBoxUi
  disabled?: boolean
}

export const AddImageBox = (props: AddImageBoxProps) => {
  const {
    payload,
    prefix = DEFAULT_FILE_SIZE_PREFIX,
    ui,
    onFileSelect,
    disabled = false,
    ...rest
  } = props
  const { valid = "idle" } = ui ?? {}
  const { count = 0, size = 0, accept = "image/*", type = [] } = payload
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
  const fileSize = transform.file.size({ bytes: size, prefix })

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
          <List.Item>{`最大 ${count} 件`}</List.Item>
          <List.Item>{`${fileSize.value} ${fileSize.unit} / 1件`}</List.Item>
          <List.Item>
            {type.map((value) => value.toLowerCase()).join(" / ")}
          </List.Item>
        </List>
      </Stack>
    </Box>
  )
}
