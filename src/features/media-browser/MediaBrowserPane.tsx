"use client"

import type { ComponentProps } from "react"
import { Box, Divider, ScrollArea } from "@mantine/core"
import { MediaBrowserToolbar } from "./MediaBrowserToolbar"
import { MediaBrowserListContent } from "./MediaBrowserListContent"

type MediaBrowserPaneProps = ComponentProps<typeof MediaBrowserToolbar> & ComponentProps<typeof MediaBrowserListContent>

export function MediaBrowserPane({ compact, selecting, selected, tags, setTags, onSubmitTags, tagOptions, context, communityId, hasRemoteItems, navigate, onSelectionDialog, onStartSelection, onEndSelection, ...contentProps }: MediaBrowserPaneProps) {
 return <Box w="100%" h="calc(100vh - 88px)" style={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, overflow: "hidden" }}>
  <MediaBrowserToolbar compact={compact} selecting={selecting} selected={selected} tags={tags} setTags={setTags} onSubmitTags={onSubmitTags} tagOptions={tagOptions} context={context} communityId={communityId} hasRemoteItems={hasRemoteItems} navigate={navigate} onSelectionDialog={onSelectionDialog} onStartSelection={onStartSelection} onEndSelection={onEndSelection} />
  <Divider />
  <ScrollArea flex={1} style={{ minHeight: 0 }}>
   <MediaBrowserListContent context={context} communityId={communityId} selecting={selecting} selected={selected} hasRemoteItems={hasRemoteItems} navigate={navigate} {...contentProps} />
  </ScrollArea>
 </Box>
}
