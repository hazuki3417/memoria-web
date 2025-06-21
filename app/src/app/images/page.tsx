"use client";
import {
  ImageSearchForm,
  imageSearchFormSchema,
  imageSearchFormDefaultValue,
} from "@/feature/images";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@mantine/core";
import { useForm } from "react-hook-form";
import { z } from "zod";

type ImageSearchFormSchema = z.infer<typeof imageSearchFormSchema>;

export default function Page() {
  const methods = useForm<ImageSearchFormSchema>({
    resolver: zodResolver(imageSearchFormSchema),
    mode: "onChange",
    defaultValues: {
      ...imageSearchFormDefaultValue,
    },
  });

  return (
    <Box>
      <ImageSearchForm control={methods.control} />
    </Box>
  );
}
