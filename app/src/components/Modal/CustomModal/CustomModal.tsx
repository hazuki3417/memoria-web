import { Box, Overlay, Portal, Transition } from "@mantine/core";
import type { ReactNode } from "react";

interface CustomModalProps {
  opened: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function CustomModal({ opened, onClose, children }: CustomModalProps) {
  return (
    <Portal>
      <Transition
        mounted={opened}
        transition="fade"
        duration={300}
        timingFunction="ease"
      >
        {(styles) => (
          <Box
            data-testid="custom-modal-base"
            style={{ ...styles, position: "fixed", inset: 0, zIndex: 150 }}
          >
            {/* NOTE: overlay: z-index: 200 */}
            <Overlay
              data-testid="overlay"
              onClick={onClose}
              opacity={0.5}
              blur={3}
            />
            <Box
              data-testid="custom-modal-frame"
              style={(theme) => ({
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 250,
                // TODO: モーダルのサイズ指定ができるように改修する
                width: "100%",
                height: "100%",
              })}
            >
              {children}
            </Box>
          </Box>
        )}
      </Transition>
    </Portal>
  );
}
