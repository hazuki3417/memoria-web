import { Box, List, Stack } from "@mantine/core";
import { IconPhotoPlus } from "@tabler/icons-react";
import classes from "./AddImageBox.module.css";
import React, { useCallback, useRef } from "react";
import { formatSize } from "@/lib/utils";

export type AddImageBoxUi = {
  valid?: "accept" | "warning" | "reject";
  disabled?: boolean;
};

export type AddImageBoxConfig = {
  count: {
    max: number;
  };
  size: {
    max: number;
    total: number;
  };
  type: string[];
};

export type AddImageBoxHandler = {
  onFileSelect?: (files: FileList | null) => void;
};

export interface AddImageBoxProps {
  config: AddImageBoxConfig;
  handler?: AddImageBoxHandler;
  ui?: AddImageBoxUi;
}

export const AddImageBox = (props: AddImageBoxProps) => {
  const { config, handler, ui } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const click = () => {
    if (ui?.disabled) {
      return;
    }

    if (ui?.valid === "reject") {
      return;
    }

    // 間接的にinput type="file"のclickイベントを発火させる
    inputRef.current?.click();
  };

  const fileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handler?.onFileSelect?.(event.target.files);
    },
    [handler?.onFileSelect],
  );

  const size = {
    single: formatSize(config.size.max, "m"),
    all: formatSize(config.size.total, "m"),
  };

  return (
    <Box
      className={classes.box}
      onClick={click}
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
        onChange={fileSelect}
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
          <List.Item>
            {`${Math.round(size.single.value)} ${size.single.unit.toUpperCase()}B`}{" "}
            / 1 件
          </List.Item>
          <List.Item>最大 {config.count.max} 枚</List.Item>
          <List.Item>
            合計{" "}
            {`${Math.round(size.all.value)} ${size.all.unit.toUpperCase()}B`}{" "}
          </List.Item>
        </List>
      </Stack>
    </Box>
  );
};
