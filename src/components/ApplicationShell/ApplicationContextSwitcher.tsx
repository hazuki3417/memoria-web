"use client"

import { Box, Button, Group, Menu, Text } from "@mantine/core"
import { IconCheck, IconPlus, IconUsers } from "@tabler/icons-react"
import type { ApplicationContextOption } from "./types"

const menuStyles = { dropdown: { border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-md)", boxShadow: "var(--mantine-shadow-md)", padding: 4, minWidth: 200 }, item: { borderRadius: "var(--mantine-radius-sm)", fontSize: "var(--mantine-font-size-sm)", minHeight: 32, padding: "5px 8px" }, label: { padding: "8px 8px 4px", fontSize: "var(--mantine-font-size-xs)" } } as const

export function ApplicationContextSwitcher({ currentContext, contexts, onSelect, onCreateCommunity }: { currentContext: ApplicationContextOption; contexts: ApplicationContextOption[]; onSelect: (contextId: string) => void; onCreateCommunity?: () => void }) {
  return <>
    <Box w={1} h={20} bg="var(--mantine-color-default-border)" aria-hidden="true" />
    <Menu withinPortal position="bottom-start" styles={menuStyles}>
      <Menu.Target><Button variant="subtle" color="gray" size="compact-sm" px="xs" aria-label="コンテキストを切り替える" maw={{ base: 144, sm: 240 }}><Text size="xs" mr={6} aria-hidden="true">▾</Text><Text size="sm" truncate>{currentContext.label}</Text></Button></Menu.Target>
      <Menu.Dropdown>
        <Menu.Label><Group gap={6} wrap="nowrap"><IconUsers size={14} stroke={1.6} aria-hidden="true" /><Text size="xs">切り替え先</Text></Group></Menu.Label>
        {contexts.map((context) => <Menu.Item key={context.id} onClick={() => onSelect(context.id)} rightSection={context.id === currentContext.id ? <IconCheck size={14} /> : null}>{context.label}</Menu.Item>)}
        {onCreateCommunity && <Menu.Item leftSection={<IconPlus size={16} stroke={1.6} aria-hidden="true" />} onClick={onCreateCommunity}>Communityを作成</Menu.Item>}
      </Menu.Dropdown>
    </Menu>
  </>
}
