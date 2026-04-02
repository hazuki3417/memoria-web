"use client"
import { ActionPanel, ButtonGroup, FieldValid, TagsInput } from "@/components"
import { useUploadImageMutation, Visibility } from "@/graphql"
import { usePreference, useTaskManager } from "@/hooks"
import { wait } from "@/lib/wait"
import { useFeedbackContext, useUserContext } from "@/providers"
import { Task, TaskValue } from "@/reducers"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  ScrollArea,
  Stack,
} from "@mantine/core"
import { t } from "i18next"
import { nanoid } from "nanoid"
import React, { useCallback, useEffect, useMemo } from "react"
import {
  Controller,
  FieldErrors,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form"
import { z } from "zod"
import {
  ImageInputForm,
  imageItemSchema,
  ImageItemSchemaConfig,
  ImageValues,
  tagsSchema,
} from "../_components"
import { ImageDropForm } from "./_components"

type ImageInputFormSchemaConfig = ImageItemSchemaConfig
const imageInputFormSchema = (config: ImageInputFormSchemaConfig) => {
  return z.object({
    bulk: z.object({
      selected: z.boolean(),
      reflection: z.boolean(),
      tags: tagsSchema(config.image.tags),
    }),
    ...imageItemSchema(config).shape,
  })
}

type ImageInputFormValues = z.infer<ReturnType<typeof imageInputFormSchema>>

const Page = () => {
  const user = useUserContext()
  const preference = usePreference()

  const inputSchema = useMemo(() => {
    return imageInputFormSchema({
      image: {
        file: {
          type: user.limit.upload.file.type,
          size: {
            max: user.limit.upload.file.size,
          },
        },
        tags: { count: { max: user.limit.upload.tag.count } },
      },
      count: {
        max: user.limit.upload.file.count,
      },
    })
  }, [user])

  const methods = useForm<ImageInputFormValues>({
    resolver: zodResolver(inputSchema),
    mode: "onChange",
    defaultValues: {
      bulk: {
        selected: true,
        reflection: true,
        tags: [],
      },
      images: [],
    },
  })

  const { getValues, setValue } = methods

  const feedback = useFeedbackContext()

  const watchValueBulkTags = useWatch({
    control: methods.control,
    name: "bulk.tags",
  })

  const watchValueImages = useWatch({
    control: methods.control,
    name: "images",
  })

  const count = {
    selected: watchValueImages.filter((image) => image.selected).length,
    total: watchValueImages.length,
  }

  const { fields, append, remove, replace } = useFieldArray({
    control: methods.control,
    name: "images",
  })

  const [uploadImage] = useUploadImageMutation()
  const manager = useTaskManager({ mode: "parallel" })

  const inputValid = async (values: ImageInputFormValues) => {
    console.log("submit values:", values)
    await manager.action.submit(async (task) => {
      const image = values.images.find((image) => task.id === image.taskId)

      if (!image) {
        return { status: "error", error: Error("image form data not found.") }
      }

      if (!image.selected) {
        return { status: "skip" }
      }

      await wait(1)

      await uploadImage({
        variables: {
          input: {
            file: image.file,
            tags: image.tags,
            visibility: Visibility.Private,
          },
        },
      })
      return { status: "success" }
    })
  }

  const inputInValid = async (errors: FieldErrors<ImageInputFormValues>) => {
    console.log("submit error:", errors)
  }

  useEffect(() => {
    switch (manager.value.meta.result) {
      case "running":
        feedback.action.info({
          title: "登録",
          body: "登録処理を開始しました。",
        })
        return
      case "success":
        feedback.action.success({
          title: "登録",
          body: "正常に終了しました。",
        })
        // resetFiles()
        // form reset （アイテムのみ）
        return
      case "partial-success":
        feedback.action.warning({
          title: "登録",
          body: "一部登録に失敗しました。",
        })
        // 成功したものみformをdisabledする
        return
      case "error":
        feedback.action.warning({
          title: "登録",
          body: "登録に失敗しました。",
        })
        return
      case "idle":
      default:
        break
    }
  }, [manager.value.meta.result])

  const addFiles = (files: FileList) => {
    const images: ImageValues[] = []
    const tasks: Task[] = []
    for (let i = 0; i < files.length; i++) {
      const id = nanoid()
      images.push({ taskId: id, selected: true, file: files[i], tags: [] })
      tasks.push({ id, status: "idle" })
    }
    append(images)
    manager.action.append(tasks)
  }

  const removeFile = (index: number, id: string) => {
    remove(index)
    manager.action.remove([id])
  }

  const resetFiles = () => {
    replace([])
    manager.action.reset()
  }

  const handleAddTags = () => {
    const images = getValues("images")
    const tags = getValues("bulk.tags")
    images.forEach((image, index) => {
      setValue(`images.${index}.tags`, addTags(image.tags, tags))
    })
  }

  const handleRemoveTags = () => {
    const images = getValues("images")
    const tags = getValues("bulk.tags")
    images.forEach((image, index) => {
      setValue(`images.${index}.tags`, removeTags(image.tags, tags))
    })
  }

  const handleReplaceTags = () => {
    const images = getValues("images")
    const tags = getValues("bulk.tags")
    images.forEach((_, index) => {
      setValue(`images.${index}.tags`, tags)
    })
  }

  const handleRemoveFiles = () => {
    replace([])
    manager.action.reset()
  }

  const handleFileDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      addFiles(event.dataTransfer.files)
    },
    [],
  )

  const handleFileSelect = useCallback((newFiles: FileList | null) => {
    if (newFiles === null) {
      return
    }
    addFiles(newFiles)
  }, [])

  const imageDropFormDisabled = useMemo(() => {
    if (!user) {
      return true
    }
    return user.limit.upload.file.count <= watchValueImages.length
  }, [watchValueImages])

  const bulkFormDisabled = (() => {
    if (fields.length === 0) {
      return true
    }
  })()

  const allFormDisabled = (() => {
    if (manager.value.meta.result === "running") {
      return true
    }
    return false
  })()

  return (
    <Box
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <ImageDropForm
        disabled={imageDropFormDisabled}
        onFileDrop={handleFileDrop}
        mb="xs"
      >
        <ImageDropForm.AddImageBox
          prefix={preference.file.fileSizeUnit}
          payload={{
            ...user.limit.upload.file,
          }}
          disabled={imageDropFormDisabled}
          onFileSelect={handleFileSelect}
        />
      </ImageDropForm>

      <Divider />

      <Box>
        <Flex align="center" w="100%">
          <Box w="160px" m="xs" pl="8px">
            <Controller
              control={methods.control}
              name={`bulk.selected`}
              render={({ field }) => {
                const { value, ...rest } = field
                return (
                  <Checkbox
                    size="xs"
                    variant="filled"
                    color="blue"
                    label={`選択：${count.selected} / ${count.total}`}
                    styles={{
                      label: {
                        paddingLeft: "calc(.625rem * 0.5)",
                      },
                    }}
                    checked={value}
                    {...rest}
                  />
                )
              }}
            />
          </Box>
          <Divider orientation="vertical" />
          <Box flex="1" m="xs">
            <Stack gap="calc(.625rem * 0.5)">
              <Controller
                control={methods.control}
                name={`bulk.tags`}
                render={({ field }) => {
                  return (
                    <TagsInput
                      size="xs"
                      label="タグ"
                      current={watchValueBulkTags.length}
                      limit={user.limit.upload.tag.count}
                      clearable
                      {...field}
                      disabled={allFormDisabled}
                    />
                  )
                }}
              />
              <Flex justify="space-between" gap="xs">
                <Controller
                  control={methods.control}
                  name={`bulk.reflection`}
                  render={({ field }) => {
                    const { value, ...rest } = field
                    return (
                      <Checkbox
                        size="xs"
                        color="blue"
                        styles={{
                          label: {
                            paddingLeft: "calc(.625rem * 0.5)",
                          },
                        }}
                        label="アップロード時に設定したタグを反映する"
                        {...rest}
                        checked={value}
                      />
                    )
                  }}
                />
                <ButtonGroup>
                  <Button
                    size="xs"
                    type="button"
                    disabled={allFormDisabled || bulkFormDisabled}
                    onClick={handleAddTags}
                  >
                    追加
                  </Button>
                  <Button
                    size="xs"
                    type="button"
                    disabled={allFormDisabled || bulkFormDisabled}
                    onClick={handleRemoveTags}
                  >
                    除去
                  </Button>
                  <Button
                    size="xs"
                    type="button"
                    disabled={allFormDisabled || bulkFormDisabled}
                    onClick={handleReplaceTags}
                  >
                    置換
                  </Button>
                </ButtonGroup>
              </Flex>
            </Stack>
          </Box>
          <Divider orientation="vertical" />
          <Box m="xs" style={{ display: "flex", alignItems: "center" }}>
            <Button
              size="xs"
              type="button"
              disabled={allFormDisabled || bulkFormDisabled}
              onClick={handleRemoveFiles}
            >
              消去
            </Button>
          </Box>
        </Flex>
      </Box>
      <Divider />

      <ImageInputForm
        methods={methods}
        submitValid={inputValid}
        submitInvalid={inputInValid}
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <ScrollArea scrollbarSize={6}>
          {fields.map((image, index) => {
            const task = manager.value.tasks.find(
              (task) => image.taskId === task.id,
            )
            const itemDisabled = task?.status === "success"
            return (
              <React.Fragment key={image.id}>
                <ImageInputForm.ImageItem
                  index={index}
                  ui={{
                    selected: image.selected,
                    valid: calcTaskValid(task?.status),
                  }}
                  config={{
                    prefix: preference.file.fileSizeUnit,
                    limit: user.limit.upload.tag.count,
                  }}
                  disabled={allFormDisabled || itemDisabled}
                  onRemove={removeFile}
                />
                <Divider />
              </React.Fragment>
            )
          })}
        </ScrollArea>
        <Divider />
        <ActionPanel mt="xs">
          <ActionPanel.Left />
          <ActionPanel.Center />
          <ActionPanel.Right>
            <Button type="submit" size="xs">
              {t("button.register")}
            </Button>
          </ActionPanel.Right>
        </ActionPanel>
      </ImageInputForm>
    </Box>
  )
}

export default Page

const calcTaskValid = (status: TaskValue | undefined): FieldValid => {
  switch (status) {
    case "success":
      return "accept"
    case "error":
      return "reject"
    case "skip":
    case "idle":
    case "running":
    default:
      return "idle"
  }
}

/**
 * 入力タグを元の配列に追加する（重複なし）
 */
const addTags = (base: string[], add: string[]) => {
  return [...new Set([...base, ...add])]
}

/**
 * 入力タグを元の配列から除去する
 * @param base
 * @param remove
 * @returns
 */
const removeTags = (base: string[], remove: string[]) => {
  return base.filter((tag) => !remove.includes(tag))
}
