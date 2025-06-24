"use client";
import {
  ImageSearchForm,
  imageSearchFormSchema,
  imageSearchFormDefaultValue,
} from "@/feature/images";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Box } from "@mantine/core";
import { useEffect, useState } from "react";
import { ImageEdge, useGetImageConnectionQuery } from "@/graphql";
import { useIntersection } from "../../hooks/useIntersection";
import { useRelayConnection } from "../../hooks/useRelayConnection";
import { nanoid } from "nanoid";
import { Image } from "@/components";
import { ImageLayout } from "@/components/ImageLayout/ImageLayout";

type ImageSearchFormSchema = z.infer<typeof imageSearchFormSchema>;

export default function Page() {
  const methods = useForm<ImageSearchFormSchema>({
    resolver: zodResolver(imageSearchFormSchema),
    mode: "onChange",
    defaultValues: {
      ...imageSearchFormDefaultValue,
    },
  });

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
    <Box>
      <ImageSearchForm control={methods.control} />
      <ImageLayout>
        <ImageLayout.Grid>
          <Image>
            {items.map((item, index) => {
              return (
                <Image.Frame key={nanoid()}>
                  <Image.Tile src="sample/h.png" alt="example" />
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
    </Box>
  );
}
