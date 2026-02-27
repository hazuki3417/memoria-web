"use client";
import { ActionPanel, Image, LinkButton } from "@/components";
import { ImageLayout } from "@/components/ImageLayout/ImageLayout";
import {
  imageSearchFormDefaultValue,
  imageSearchFormSchema,
} from "@/feature/images";
import { ImageEdge, useGetImagesQuery } from "@/graphql";
import { useIntersection } from "@/hooks/useIntersection";
import { useRelayConnection } from "@/hooks/useRelayConnection";
import { defineFieldObject } from "@/lib/field";
import { resolveUri } from "@/lib/url";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Center,
  Flex,
  SegmentedControl,
  Tabs,
  TagsInput,
} from "@mantine/core";
import {
  IconCheckbox,
  IconDownload,
  IconEdit,
  IconLibraryPlus,
  IconListSearch,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { t } from "i18next";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const TAB_ID_LIST = ["list", "group"] as const;
const TAB_FIELDS = defineFieldObject(TAB_ID_LIST);

type ImageSearchFormSchema = z.infer<typeof imageSearchFormSchema>;

const Page = () => {
  const methods = useForm<ImageSearchFormSchema>({
    resolver: zodResolver(imageSearchFormSchema),
    mode: "onChange",
    defaultValues: {
      ...imageSearchFormDefaultValue,
    },
  });

  const [lists, setlists] = useState<ImageEdge[]>([]);

  const relay = useRelayConnection({
    hooks: () =>
      useGetImagesQuery({
        variables: {
          input: { first: 25 },
        },
        notifyOnNetworkStatusChange: true,
      }),
    extract: (data) => data.getImages,
    size: 10,
  });

  const intersection = useIntersection({
    intersect: async () => {
      if (!relay.state.pageInfo?.hasNextPage) return;
      const res = await relay.handler.next();
      setlists((prev) => [...prev, ...res.data.getImages.edges]);
    },
  });

  // 初期レンダリング時の処理
  useEffect(() => {
    if (relay.state.edges.length > 0 && lists.length === 0) {
      setlists(relay.state.edges);
    }
  }, [relay.state.edges, lists.length]);

  const [mode, setMode] = useState<"filter" | "bulk">("filter");

  return (
    <Box>
      <Tabs color="gray" variant="pills" defaultValue={TAB_FIELDS.list}>
        <Tabs.List mb="xs">
          <Tabs.Tab value={TAB_FIELDS.list}>{t("label.list")}</Tabs.Tab>
          <Tabs.Tab value={TAB_FIELDS.group}>{t("label.group")}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={TAB_FIELDS.list}>
          <ActionPanel mb="xs">
            <ActionPanel.Left>
              {mode === "filter" && (
                <Flex align="center" gap="xs" w="100%">
                  <TagsInput
                    size="xs"
                    placeholder={t("placeholder.tag")}
                    leftSection={<IconSearch size={16} />}
                    clearable
                    flex={1}
                  />
                  <Button size="xs">{t("button.search")}</Button>
                </Flex>
              )}
              {mode === "bulk" && (
                <Flex align="center" gap="xs">
                  <Button size="xs" leftSection={<IconEdit size={16} />}>
                    {t("button.edit")}
                  </Button>
                  <Button size="xs" leftSection={<IconTrash size={16} />}>
                    {t("button.delete")}
                  </Button>
                  <Button size="xs" leftSection={<IconDownload size={16} />}>
                    {t("button.download")}
                  </Button>
                  <div>0 件選択中</div>
                </Flex>
              )}
            </ActionPanel.Left>
            <ActionPanel.Right>
              <Flex align="center" gap="xs">
                <LinkButton size="xs" leftSection={<IconLibraryPlus size={16} />}
                  href={resolveUri("/images/new")}>
                  {t("button.new")}
                </LinkButton>
                <SegmentedControl
                  value={mode}
                  onChange={(value) => setMode(value as "filter" | "bulk")}
                  data={[
                    {
                      value: "filter",
                      label: (
                        <Center style={{ gap: 10 }}>
                          <IconListSearch size={16} />
                          <span>{t("label.filter")}</span>
                        </Center>
                      ),
                    },
                    {
                      value: "bulk",
                      label: (
                        <Center style={{ gap: 10 }}>
                          <IconCheckbox size={16} />
                          <span>{t("label.bulk")}</span>
                        </Center>
                      ),
                    },
                  ]}
                />
              </Flex>
            </ActionPanel.Right>
          </ActionPanel>
          <ImageLayout>
            <ImageLayout.Grid>
              <Image>
                {lists.map((list, index) => {
                  return (
                    <Image.Frame key={nanoid()}>
                      <Image.Tile
                        src={list.node.src.thumbnail}
                        alt={list.node.info.file.name}
                      />
                    </Image.Frame>
                  );
                })}
                {/* NOTE: IntersectionObserverの監視対象は常に存在するようにする */}
                <Image.Intersection
                  ref={intersection.ref}
                  visible={relay.state.pageInfo?.hasNextPage || false}
                />
              </Image>
            </ImageLayout.Grid>
          </ImageLayout>
        </Tabs.Panel>
        <Tabs.Panel value={TAB_FIELDS.group}>group panel</Tabs.Panel>
      </Tabs>
    </Box>
  );
};

export default Page;
