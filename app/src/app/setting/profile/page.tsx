"use client";
import {
  ProfileInputForm,
  profileInputFormDefaultValue,
  profileInputFormSchema,
} from "@/feature/setting/profile/ProfileInputForm";
import { SideMenu } from "@/feature/setting/SideMenu";
import { zodResolver } from "@hookform/resolvers/zod";
import { Flex } from "@mantine/core";
import { usePathname } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";

const Page = () => {
  const pathname = usePathname();

  const methods = useForm({
    resolver: zodResolver(profileInputFormSchema),
    mode: "onChange",
    defaultValues: {
      ...profileInputFormDefaultValue,
    },
  });

  return (
    <Flex direction={{ base: "column", sm: "row" }} gap={16}>
      <SideMenu current={pathname} />
      <FormProvider {...methods}>
        <ProfileInputForm control={methods.control} />
      </FormProvider>
    </Flex>
  );
};

export default Page;
