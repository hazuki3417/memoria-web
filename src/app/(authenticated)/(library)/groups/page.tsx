"use client"
import { ActionPanel, ImageLayout } from "@/components"
import { ImageGroup } from "@/feature"
import { TAB_FIELDS, Tabs } from "../_components"

const Page = () => {
  return (
    <Tabs value={TAB_FIELDS.group}>
      {/* FIX: 仮実装 */}
      <ActionPanel mb="xs">
        <ActionPanel.Left>
          <Tabs.List />
        </ActionPanel.Left>
        <ActionPanel.Center></ActionPanel.Center>
        <ActionPanel.Right></ActionPanel.Right>
      </ActionPanel>
      <Tabs.Panel value={TAB_FIELDS.group}>
        <ImageLayout>
          <ImageLayout.Grid>
            <ImageGroup>
              <ImageGroup.CountBadge value={42} />
              <ImageGroup.ImageContainer>
                <ImageGroup.Image bdrs="xs" src={"sample/thumbnail0.webp"} />
                <ImageGroup.Image bdrs="xs" src={"sample/thumbnail1.webp"} />
                <ImageGroup.Image bdrs="xs" src={"sample/thumbnail2.webp"} />
              </ImageGroup.ImageContainer>
              <ImageGroup.InfoContainer>
                <ImageGroup.Title>グループ1</ImageGroup.Title>
              </ImageGroup.InfoContainer>
            </ImageGroup>
            <ImageGroup>
              <ImageGroup.CountBadge value={20} />
              <ImageGroup.ImageContainer>
                <ImageGroup.Image bdrs="xs" src={"sample/thumbnail1.webp"} />
                <ImageGroup.Image bdrs="xs" src={"sample/thumbnail0.webp"} />
                <ImageGroup.Image bdrs="xs" src={"sample/thumbnail2.webp"} />
              </ImageGroup.ImageContainer>
              <ImageGroup.InfoContainer>
                <ImageGroup.Title>グループ1</ImageGroup.Title>
              </ImageGroup.InfoContainer>
            </ImageGroup>
            <ImageGroup ui={{ selected: true }}>
              <ImageGroup.CountBadge value={15} />
              <ImageGroup.ImageContainer>
                <ImageGroup.Image bdrs="xs" src={"sample/thumbnail1.webp"} />
                <ImageGroup.Image bdrs="xs" src={"sample/thumbnail2.webp"} />
                <ImageGroup.Image bdrs="xs" src={"sample/thumbnail0.webp"} />
                <ImageGroup.Image bdrs="xs" src={"sample/thumbnail0.webp"} />
              </ImageGroup.ImageContainer>
              <ImageGroup.InfoContainer>
                <ImageGroup.Title>グループ1</ImageGroup.Title>
              </ImageGroup.InfoContainer>
            </ImageGroup>
          </ImageLayout.Grid>
        </ImageLayout>
      </Tabs.Panel>
    </Tabs>
  )
}

export default Page
