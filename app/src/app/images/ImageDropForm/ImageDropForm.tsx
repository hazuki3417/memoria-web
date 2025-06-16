import { Box, Input, InputError, Stack } from "@mantine/core";
import React from "react";
import { AddImageBox } from "./AddImageBox";
import { PreviewImageBox } from "./PreviewImageBox";
import classes from "./ImageDropForm.module.css";

export type ImageDropFormUi = {
  valid?: "idle" | "accept" | "warning" | "reject";
  disabled?: boolean;
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

  const disableFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <Input.Wrapper>
      <Box
        className={classes.droparea}
        onDrop={
          ui.disabled || error !== undefined ? disableFileDrop : onFileDrop
        }
        onDragOver={dragOver}
        data-valid={ui.valid || error !== undefined}
        data-disabled={ui.disabled}
      >
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "16px",
            minHeight: "inherit",
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
