import { Box } from "@mantine/core";
import { IconPhotoPlus } from "@tabler/icons-react";
import classes from "./AddImageBox.module.css";
import React, { useCallback, useRef } from "react";

export interface AddImageBox {
  onFileSelect?: (files: FileList | null) => void;
}

export const AddImageBox = (props: AddImageBox) => {
  const { onFileSelect } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const click = () => {
    // 間接的にinput type="file"のclickイベントを発火させる
    inputRef.current?.click();
  };

  const fileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFileSelect?.(event.target.files);
    },
    [onFileSelect],
  );

  return (
    <Box className={classes.box} onClick={click}>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: "none" }}
        onChange={fileSelect}
      />
      <IconPhotoPlus size={60} />
    </Box>
  );
};
