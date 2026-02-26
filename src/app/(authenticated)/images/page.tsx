"use client";
import { Image } from "@/components";
import { ImageLayout } from "@/components/ImageLayout/ImageLayout";
import {
  ImageSearchForm,
  imageSearchFormDefaultValue,
  imageSearchFormSchema,
} from "@/feature/images";
import { ImageEdge, useGetImagesQuery } from "@/graphql";
import { useIntersection } from "@/hooks/useIntersection";
import { useRelayConnection } from "@/hooks/useRelayConnection";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@mantine/core";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type ImageSearchFormSchema = z.infer<typeof imageSearchFormSchema>;

const Page = () => {
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
      setItems((prev) => [...prev, ...res.data.getImages.edges]);
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
                  <Image.Tile src={item.node.src.thumbnail} alt={item.node.info.file.name} />
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
};

export default Page;
