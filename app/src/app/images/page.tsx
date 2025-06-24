"use client";
import {
  ImageSearchForm,
  imageSearchFormSchema,
  imageSearchFormDefaultValue,
} from "@/feature/images";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Box, Card, Text, Stack, Loader } from "@mantine/core";
import { useEffect, useState } from "react";
import { ImageEdge, useGetImageConnectionQuery } from "@/graphql";
import { useIntersection } from "../../hooks/useIntersection";
import { useRelayConnection } from "../../hooks/useRelayConnection";
import { nanoid } from "nanoid";

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
      <ItemList />
    </Box>
  );
}

export const ItemList = () => {
  const [items, setItems] = useState<ImageEdge[]>([]);

  const relay = useRelayConnection({
    hooks: () =>
      useGetImageConnectionQuery({
        variables: {
          input: { first: 5 },
        },
        notifyOnNetworkStatusChange: true,
      }),
    extract: (data) => data.images,
    size: 10,
  });

  const intersection = useIntersection({
    intersect: async () => {
      if (!relay.state.pageInfo?.hasNextPage) return;
      const res = await relay.handler.next();
      setItems((prev) => [...prev, ...res.data.images.edges]);
    },
  });

  // 初期レンダリング時の処理
  useEffect(() => {
    if (relay.state.edges.length > 0 && items.length === 0) {
      setItems(relay.state.edges);
    }
  }, [relay.state.edges, items.length]);

  return (
    <Stack>
      {items.map((item, index) => {
        return (
          <Card key={item.node.id} shadow="sm" padding="lg">
            <Card.Section>
              <Text>card</Text>
            </Card.Section>
            <Text mt="md">
              {index + 1}. {item.node.id}
            </Text>
          </Card>
        );
      })}

      {/* NOTE: IntersectionObserverの監視対象は常に存在するようにする */}
      <Box ta="center" py="md" ref={intersection.ref}>
        {relay.state.pageInfo?.hasNextPage && <Loader size="sm" />}
      </Box>
    </Stack>
  );
};
