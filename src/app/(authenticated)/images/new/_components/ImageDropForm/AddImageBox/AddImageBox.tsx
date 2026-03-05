import { viewConfig } from "@/config"
import { format } from "@/lib"
import { List, Paper, Stack } from "@mantine/core"
import { IconPhotoPlus } from "@tabler/icons-react"
import React, { useRef } from "react"
import classes from "./AddImageBox.module.css"

export type AddImageBoxConfig = {
  count: {
    max: number
  }
  size: {
    max: number
    total: number
  }
  type: string[]
}

export type AddImageBoxUi = {
  valid?: "idle" | "accept" | "warning" | "reject"
  disabled?: boolean
}

export interface AddImageBoxProps {
  ui: AddImageBoxUi
  onFileSelect?: (files: FileList | null) => void
  config: AddImageBoxConfig
}

export const AddImageBox = (props: AddImageBoxProps) => {
  const { config, ui, onFileSelect } = props
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (ui?.disabled) {
      return
    }

    if (ui?.valid === "reject") {
      return
    }

    // 間接的にinput type="file"のclickイベントを発火させる
    inputRef.current?.click()
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (ui.disabled) {
      return
    }
    onFileSelect?.(event.target.files)
  }

  const size = format.file.size(config.size.max, {
    decimals: 0,
    unit: viewConfig.file.size.unit,
  })

  return (
    <Paper
      className={classes.box}
      onClick={handleClick}
      data-valid={ui?.valid}
      data-disabled={ui?.disabled}
      data-testid="add-file"
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
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
          <List.Item>
            {config.type
              .map((value) => value.replace("image/", ""))
              .join(" / ")}
          </List.Item>
          <List.Item>{`${size.value} ${size.unit} / 1件`}</List.Item>
          <List.Item>{`最大 ${config.count.max} 枚`}</List.Item>
        </List>
      </Stack>
    </Paper>
  )
}
