import { ActionPanel, ContentLayout } from "@/components"
import { ThumbnailBox } from "@/feature"
import { ImageDetailPayload } from "@/providers"
import { Box, Button, ButtonGroup, InputDescription, InputLabel, InputWrapper, TextInput } from "@mantine/core"
import { t } from "i18next"

const THUMBNAIL_VIEW_LIMIT = 4

export interface CreateImageGroupFormProps {
  items: ImageDetailPayload[]
}

export const CreateImageGroupForm = (props: CreateImageGroupFormProps) => {
  const { items } = props

  return (
    <Box>
      <Box mb="xs">
        <InputWrapper>
          <InputLabel>選択中の画像</InputLabel>
          <ContentLayout.Slide>
            {items.slice(0, THUMBNAIL_VIEW_LIMIT).map((item) => {
              return (
                <ThumbnailBox key={item.id}>
                  <ThumbnailBox.Image
                    bdrs="sm"
                    src={item.image.thumbnail}
                    alt={item.image.alt}
                  />
                </ThumbnailBox>
              )
            })}
          </ContentLayout.Slide>
          <InputDescription>
            {items.length <= THUMBNAIL_VIEW_LIMIT ? items.length : `+${items.length - THUMBNAIL_VIEW_LIMIT}`}
            件の画像を選択中
          </InputDescription>
        </InputWrapper>
        <TextInput size="xs" label="グループ名" />
      </Box>
      <ActionPanel>
        <ActionPanel.Left />
        <ActionPanel.Center />
        <ActionPanel.Right>
          <ButtonGroup>
            <Button
              size="xs"
            >
              {t("button.create")}
            </Button>
          </ButtonGroup>
        </ActionPanel.Right>
      </ActionPanel>
    </Box>
  )


}
