import "@mantine/core/styles.css";
import type { Metadata } from "next";
import type { FC } from "react";
import type { ReactNode } from "react";
import Head from "./Head";
import Providers from "./Providers";
import { Header } from "@/components";

const metadata: Metadata = {
  title: "Memoria",
  description: "Memoria",
};

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html data-mantine-color-scheme="dark">
      {/* FIX: data-mantine-color-scheme="dark"の記述がない場合、ハイドレーションの差分が発生してエラーになる */}
      <Head />
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
export { metadata };
