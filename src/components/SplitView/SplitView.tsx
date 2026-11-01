"use client"

import { Root } from "./Root"
import { Pane } from "./Pane"
import { Separator } from "./Separator"
export type { SplitViewRootProps, SplitViewPaneProps, SplitViewSeparatorProps } from "./types"

Root.displayName = "SplitView.Root"
Pane.displayName = "SplitView.Pane"
Separator.displayName = "SplitView.Separator"

export const SplitView = { Root, Pane, Separator }
