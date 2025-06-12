"use client";
import { CustomModal } from "@/components/Modal/CustomModal/CustomModal";
import { ImageDetailModal } from "@/components/Modal/ImageDetailModal";
import { useDisclosure } from "@/hooks";
import { Box } from "@mantine/core";

export default function Home() {
  const modal = useDisclosure({ opend: false });

  return (
    <Box>
      <p>Next.js検証用リポジトリ</p>
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
}
