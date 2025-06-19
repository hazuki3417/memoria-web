"use client";
import { CustomModal } from "@/components/Modal/CustomModal/CustomModal";
import { ImageDetailModal } from "@/components/Modal/ImageDetailModal";
import { useDisclosure } from "@/hooks";
import { Box } from "@mantine/core";
import { useTranslation } from "react-i18next";

const Page = () => {
  const modal = useDisclosure({ opend: false });
  const { t } = useTranslation();

  return (
    <Box>
      <p>Next.js検証用リポジトリ</p>
      <h1>{t("hello")}</h1>
      <button type="button" onClick={modal.handler.open}>
        modal
      </button>
      <CustomModal opened={modal.state.opend} onClose={modal.handler.close}>
        <ImageDetailModal
          payload={{
            slide: {
              current: 1,
              limit: 20,
            },
            info: {
              file: {
                name: "example.png",
                size: "24.5MB",
                date: "2025/01/01",
              },
              image: {
                width: 1200,
                height: 1000,
              },
              tags: ["SAO", "ジークアクス", "Fate"],
            },
          }}
          handler={{
            onClose: modal.handler.close,
          }}
        />
      </CustomModal>
    </Box>
  );
};
export default Page;
