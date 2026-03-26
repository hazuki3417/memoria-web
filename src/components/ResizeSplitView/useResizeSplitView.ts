import { useCallback } from "react"
import { useGroupRef } from "react-resizable-panels"
import { ResizeSplitViewLayout } from "./types"

export const useResizeSplitView = () => {
  const groupRef = useGroupRef()

  const getLayout = useCallback((): ResizeSplitViewLayout | undefined => {
    if (!groupRef) {
      return undefined
    }
    const layout = groupRef.current?.getLayout()
    if (!layout) {
      return undefined
    }
    return layout as ResizeSplitViewLayout
  }, [groupRef])

  const setLayout = useCallback(
    (layout: ResizeSplitViewLayout) => {
      if (!groupRef) return
      groupRef.current?.setLayout({ ...layout })
    },
    [groupRef],
  )

  return {
    groupRef,
    getLayout,
    setLayout,
  }
}
