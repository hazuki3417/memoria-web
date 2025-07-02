"use client";
import { SideMenu } from "@/feature/setting/SideMenu";
import { Box, Flex } from "@mantine/core";
import { usePathname } from "next/navigation";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = (props: LayoutProps) => {
  const { children } = props;

  const pathname = usePathname();

  return (
    <Flex direction={{ base: "column", sm: "row" }} gap={16}>
      <SideMenu current={pathname} />
      <Box component="section">{children}</Box>
    </Flex>
  );
};

export default Layout;
