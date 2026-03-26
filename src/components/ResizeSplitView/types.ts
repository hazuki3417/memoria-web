import { PANEL_ID_LIST } from "./constants"

export type ResizeSplitViewLayout = Record<
  (typeof PANEL_ID_LIST)[number],
  number
>
