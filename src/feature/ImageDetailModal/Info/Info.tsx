import { imageTagsSchema, ImageTagsSchemaConfig } from "@/app/(authenticated)/(library)/images/_components"
import { ButtonGroup, FormModeSwitch, useUseFormModeSwitch } from "@/components"
import { useUpdateImageMutation } from "@/graphql"
import {
  DEFAULT_FILE_SIZE_PREFIX,
  FileSizePrefix,
  transform,
} from "@/lib/transform"
import { useFeedbackContext, useUserContext } from "@/providers"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ActionIcon,
  Badge,
  Box,
  Divider,
  Flex,
  Grid,
  Paper,
  type PaperProps,
  TagsInput,
  Text
} from "@mantine/core"
import { IconCheck, IconEdit, IconTrash, IconX } from "@tabler/icons-react"
import type React from "react"
import { useEffect } from "react"
import { Controller, FieldErrors, useForm } from "react-hook-form"
import z from "zod"
import { Body } from "./Body"
import { Footer } from "./Footer"
import { Header } from "./Header"

export type InfoPayload = {
  file: {
    name: string
    size: number
    date: string
  }
  image: {
    width: number
    height: number
  }
  tags: string[]
}

export type InfoHandler = {
  onClose?: React.MouseEventHandler<HTMLButtonElement>
  onEdit?: React.MouseEventHandler<HTMLButtonElement>
  onDelete?: React.MouseEventHandler<HTMLButtonElement>
}

export interface InfoProps extends PaperProps {
  payload: InfoPayload
  prefix?: FileSizePrefix
  handler?: InfoHandler
}

const imageInputFormSchema = (config: ImageTagsSchemaConfig) => {
  return z.object({
    id: z.string(),
    tags: imageTagsSchema(config)
  })
}

type ImageInputFormValues = z.infer<
  ReturnType<typeof imageInputFormSchema>
>

export const Info = (props: InfoProps) => {
  const { payload, prefix = DEFAULT_FILE_SIZE_PREFIX, handler } = props
  const size = transform.file.size({ bytes: payload.file.size, prefix })

  const user = useUserContext()

  const feedback = useFeedbackContext()

  const inputSchema = imageInputFormSchema({ count: { max: user.limit.upload.tag.count } })

  const methods = useForm<ImageInputFormValues>({
    resolver: zodResolver(inputSchema),
    mode: "onChange",
    defaultValues: {
      tags: payload.tags,
    },
  })
  const { handleSubmit, control, reset } = methods

  const [updateImage, result] = useUpdateImageMutation()

  const inputValid = async (values: ImageInputFormValues) => {
    console.log("submit values:", values)
    // idがなくてこけるのでidをうけとるようにする
    await updateImage({
      variables: {
        input: {
          ...values,
        },
      },
    })
    formModeSwitch.control.view()
  }

  const inputInValid = async (errors: FieldErrors<ImageInputFormValues>) => {
    console.log("submit error:", errors)
  }


  const formModeSwitch = useUseFormModeSwitch("view")

  const handleEdit = () => {
    formModeSwitch.control.edit()
    reset({ tags: payload.tags })
  }

  const handleCancel = () => {
    formModeSwitch.control.view()
  }

  useEffect(() => {
    reset({ tags: payload.tags })
  }, [payload])


  useEffect(() => {
    const { data, error } = result

    if (error) {
      feedback.action.warning({
        title: "更新",
        body: "更新に失敗しました。",
      })
    }

    if (data) {
      feedback.action.success({
        title: "更新",
        body: "正常に終了しました。",
      })
    }
  }, [result])

  return (
    <Paper
      data-testid="info"
      p={0}
      radius={0}
      style={(theme) => ({
        display: "flex",
        flexDirection: "column",
        width: "340px",
        height: "100%",
      })}
    >
      <Header
        style={(theme) => ({
          display: "flex",
          height: "40px",
          flexShrink: 0,
          justifyContent: "space-between",
          padding: "0px 8px",
        })}
      >
        <Box
          style={(theme) => ({
            display: "flex",
            alignItems: "center",
          })}
        >
          <Text>情報</Text>
        </Box>
        <Box
          style={(theme) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <ActionIcon
            color="gray"
            size="input-xs"
            variant="subtle"
            data-testid="close-info"
            onClick={handler?.onClose}
          >
            <IconX />
          </ActionIcon>
        </Box>
      </Header>
      <Divider />
      <Body
        style={(theme) => ({
          flexGrow: 1,
          padding: "8px 8px",
        })}
      >
        <form onSubmit={handleSubmit(inputValid, inputInValid)}>
          <Grid>
            <Grid.Col span={4}>
              <Text size="xs">ファイル名</Text>
            </Grid.Col>
            <Grid.Col span={8}>
              <Text size="xs">{payload.file.name}</Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="xs">ファイルサイズ</Text>
            </Grid.Col>
            <Grid.Col span={8}>
              <Text size="xs">{`${size.value} ${size.unit}`}</Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="xs">サイズ</Text>
            </Grid.Col>
            <Grid.Col span={8}>
              <Text size="xs">
                {payload.image.width} x {payload.image.height}
              </Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="xs">登録日付</Text>
            </Grid.Col>
            <Grid.Col span={8}>
              <Text size="xs">{payload.file.date}</Text>
            </Grid.Col>
            {/* タグの特殊行 */}
            <Grid.Col span={12}>
              <Flex align="center" justify="space-between">
                <Text size="xs">タグ</Text>
                <FormModeSwitch mode={formModeSwitch.value.mode}>
                  <ButtonGroup>
                    <FormModeSwitch.View>
                      <ActionIcon
                        color="blue"
                        size="xs"
                        variant="subtle"
                        data-testid="edit-info"
                        onClick={handleEdit}
                      >
                        <IconEdit />
                      </ActionIcon>
                    </FormModeSwitch.View>
                    <FormModeSwitch.Edit>
                      <ActionIcon
                        color="red"
                        size="xs"
                        variant="subtle"
                        data-testid="cancel-info"
                        onClick={handleCancel}
                      >
                        <IconX />
                      </ActionIcon>
                      <ActionIcon
                        color="green"
                        size="xs"
                        variant="subtle"
                        data-testid="update-info"
                        type="submit"
                      >
                        <IconCheck />
                      </ActionIcon>
                    </FormModeSwitch.Edit>
                  </ButtonGroup>
                </FormModeSwitch>
              </Flex>
            </Grid.Col>
            <Grid.Col
              span={12}
              style={{
                display: "flex",
                gap: "4px",
              }}
            >
              <FormModeSwitch mode={formModeSwitch.value.mode}>
                <FormModeSwitch.View>
                  {payload.tags.map((tag) => (
                    <Badge key={tag} variant="light" size="sm" radius="sm">
                      {tag}
                    </Badge>
                  ))}
                </FormModeSwitch.View>
                <FormModeSwitch.Edit>
                  <Controller
                    control={control}
                    name="tags"
                    render={({ field }) => {
                      return (
                        <TagsInput
                          size="xs"
                          w="100%"

                          {...field}
                          clearable
                        />
                      )
                    }}
                  />
                </FormModeSwitch.Edit>
              </FormModeSwitch>
            </Grid.Col>
          </Grid>
        </form>
      </Body>
      <Divider />
      <Footer
        style={(theme) => ({
          height: "40px",
          flexShrink: 0,
          padding: "0px 8px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        })}
      >
        <Box
          style={(theme) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
        </Box>
        <Box
          style={(theme) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <ActionIcon
            color="gray"
            size="input-xs"
            variant="subtle"
            data-testid="delete-image"
            onClick={handler?.onDelete}
          >
            <IconTrash />
          </ActionIcon>
        </Box>
      </Footer>
    </Paper>
  )
}
