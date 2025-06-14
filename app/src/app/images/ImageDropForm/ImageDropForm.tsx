import { Box, Input, InputError, Stack } from "@mantine/core";
import React from "react";
import { AddImageBox } from "./AddImageBox";
import { PreviewImageBox } from "./PreviewImageBox";
import classes from "./ImageDropForm.module.css";

export type ImageDropFormUi = {
  reject: boolean;
  accept: boolean;
};

export interface ImageDropFormProps {
  children: React.ReactNode;
  ui: ImageDropFormUi;
  error?: React.ReactNode;
  onFileDrop?: React.DragEventHandler<HTMLDivElement>;
}

export const ImageDropForm = (props: ImageDropFormProps) => {
  const { children, ui, error, onFileDrop } = props;

  const dragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <Input.Wrapper>
      <Box
        className={classes.droparea}
        onDrop={error === undefined ? onFileDrop : undefined}
        onDragOver={error === undefined ? dragOver : undefined}
        data-accept={ui.accept}
        data-reject={ui.reject || error !== undefined}
      >
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {children}
        </Box>
      </Box>
      {error && <InputError>{error}</InputError>}
    </Input.Wrapper>
  );
};

ImageDropForm.AddImageBox = AddImageBox;
ImageDropForm.PreviewImageBox = PreviewImageBox;
