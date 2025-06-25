import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "@/lib/zod";
import type { Metadata } from "next";
import Head from "./Head";
import Providers from "./Providers";
import { Header } from "@/components";
import { Container } from "@mantine/core";
import { getLang } from "@/lib/cookies/lang/getLang";
import { auth } from "@/lib/auth";

const metadata: Metadata = {
  title: "Memoria",
  description: "Memoria",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout = async (props: RootLayoutProps) => {
  const { children } = props;
  const lang = await getLang();
  const session = await auth.getSession();
  return (
    <html data-mantine-color-scheme="dark" lang={lang}>
      {/* FIX: data-mantine-color-scheme="dark"の記述がない場合、ハイドレーションの差分が発生してエラーになる */}
      <Head />
      <body>
        <Providers user={session?.user}>
          <Header />
          <main>
            <Container p={"lg"} m={0} fluid>
              {children}
            </Container>
          </main>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
export { metadata };
