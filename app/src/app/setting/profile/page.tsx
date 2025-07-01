"use client";
import { SideMenu } from "@/feature/setting/SideMenu";
import { Box, SimpleGrid, TextInput } from "@mantine/core";
import { usePathname } from "next/navigation";

const Page = () => {
  const pathname = usePathname();
  return (
    <SimpleGrid
      cols={{ base: 1, sm: 1, md: 2 }} // md以上は2カラム、sm以下は1カラム
      spacing="lg"
    >
      <SideMenu current={pathname} />

      {/* メインコンテンツ */}
      <Box component="section">
        <TextInput
          placeholder="John Doe"
          label="UserName"
          withAsterisk
          size="xs"
        />
        <TextInput
          placeholder="john.doe@memoria.com"
          label="E-mail"
          withAsterisk
          size="xs"
        />
      </Box>
    </SimpleGrid>
  );
};

export default Page;
