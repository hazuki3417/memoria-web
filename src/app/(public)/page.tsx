"use client"
import { defineFieldObject } from "@/lib/field"
import { Box } from "@mantine/core"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useGroupRef } from "react-resizable-panels"

const PANEL_ID_LIST = ["left", "right"] as const
export const PANEL_FIELDS = defineFieldObject(PANEL_ID_LIST)

const Page = () => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const groupRef = useGroupRef()

  const toggleRightPanel = () => {
    const ref = groupRef.current
    if (ref === null) {
      return
    }

    if (open) {
      ref.setLayout({
        [PANEL_FIELDS.left]: 100,
        [PANEL_FIELDS.right]: 0,
      })
    } else {
      ref.setLayout({
        [PANEL_FIELDS.left]: 50,
        [PANEL_FIELDS.right]: 50,
      })
    }
    setOpen(!open)
  }

  return (
    <Box>
      <p>Next.js検証用リポジトリaa</p>
      <h1>{t("hello")}</h1>
      <div style={{ padding: 8 }}>
        <button onClick={toggleRightPanel}>
          {open ? "Close Right" : "Open Right"}
        </button>
      </div>
    </Box>
  )
}
export default Page
