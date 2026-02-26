import React from "react";

export interface FormPreviewProps {
  label?: string;
  children: React.ReactNode;
}

export const FormPreview = (props: FormPreviewProps) => {
  const { label, children } = props;
  return (
    <div>
      {label && <div>{label}</div>}
      {children}
    </div>
  );
};
