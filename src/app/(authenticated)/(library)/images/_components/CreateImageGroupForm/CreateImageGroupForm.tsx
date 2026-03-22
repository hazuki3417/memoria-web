import { ActionPanel, ContentLayout } from "@/components"
import { ThumbnailBox } from "@/feature"
import { ImageDetailPayload } from "@/providers"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Box,
  Button,
  ButtonGroup,
  InputDescription,
  InputLabel,
  InputWrapper,
  TextInput,
} from "@mantine/core"
import { t } from "i18next"
import {
  Controller,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from "react-hook-form"
import z from "zod"

const imageGroupinputFormSchema = z.object({
  name: z.string(),
  ids: z.array(z.string()),
})

export type ImageGroupInputFormValues = z.infer<
  typeof imageGroupinputFormSchema
>

const THUMBNAIL_VIEW_LIMIT = 4

export interface CreateImageGroupFormProps {
  items: ImageDetailPayload[]
  submitValid?: SubmitHandler<ImageGroupInputFormValues>
  submitInvalid?: SubmitErrorHandler<ImageGroupInputFormValues>
}

export const CreateImageGroupForm = (props: CreateImageGroupFormProps) => {
  const { items, submitValid = () => {}, submitInvalid = () => {} } = props

  const methods = useForm<ImageGroupInputFormValues>({
    resolver: zodResolver(imageGroupinputFormSchema),
    defaultValues: {
      name: "",
      ids: items.map((item) => item.id),
    },
  })

  const { handleSubmit } = methods

  return (
    <Box>
      <form onSubmit={handleSubmit(submitValid, submitInvalid)}>
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
              {items.length <= THUMBNAIL_VIEW_LIMIT
                ? items.length
                : `+${items.length - THUMBNAIL_VIEW_LIMIT}`}
              件の画像を選択中
            </InputDescription>
          </InputWrapper>
          <Controller
            control={methods.control}
            name={`name`}
            render={({ field }) => (
              <TextInput size="xs" label="グループ名" {...field} />
            )}
          />
        </Box>
        <ActionPanel>
          <ActionPanel.Left />
          <ActionPanel.Center />
          <ActionPanel.Right>
            <ButtonGroup>
              <Button size="xs" type="submit">
                {t("button.create")}
              </Button>
            </ButtonGroup>
          </ActionPanel.Right>
        </ActionPanel>
      </form>
    </Box>
  )
}
