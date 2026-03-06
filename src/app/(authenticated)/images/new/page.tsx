"use client"
import { ActionPanel, ButtonGroup } from "@/components"
import { imageConfig } from "@/config"
import { PreviewImageBox } from "@/feature"
import { useUploadImageMutation, Visibility } from "@/graphql"
import { useTaskManager } from "@/hooks"
import { zod } from "@/lib"
import { useFeedbackContext } from "@/providers"
import { Task } from "@/reducers"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Box,
  Button,
  Divider,
  Flex,
  ScrollArea,
  Stack,
  TagsInput,
  Text,
} from "@mantine/core"
import { nanoid } from "nanoid"
import React, { useCallback, useEffect, useMemo } from "react"
import { Controller, FieldErrors, useFieldArray, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { ImageDropForm } from "./_components"

const fileSchema = zod.refine(
  z.custom<File>((file) => file instanceof File),
  [
    zod.validate.file.type(imageConfig.type),
    zod.validate.file.size.tooLarge(imageConfig.size.max),
  ],
)

const tagsSchema = z.array(z.string())

const imageSchema = z.object({
  id: z.string(),
  selectable: z.boolean(),
  file: fileSchema,
  tags: tagsSchema,
})
type ImageValues = z.infer<typeof imageSchema>

const inputFormSchema = z.object({
  bulk: z.object({
    tags: tagsSchema,
  }),
  images: z.array(imageSchema).max(imageConfig.count.max),
})

type InputFormValues = z.infer<typeof inputFormSchema>

/**
 * NOTE: 仕様
 *       - ドラッグ & ドロップ
 *         - 常に可能。下記のケースに一致するファイルも可能
 *           - サポートしていないファイルのドロップ
 *           - サイズ上限を超えている状態
 *       - ファイル選択
 *         - 対応しているファイル形式のみ可能。下記のケースに一致するファイルは選択可能
 *           - サイズ上限を超えるファイル
 *       - バリデーション
 *         - 全体
 *           - ファイルの登録上限を超えた場合
 *             - 追加ボタン非表示
 *             - ドラッグ & ドロップ可能
 *             - カーソル変更（no-drop）
 *             - 背景色変更（赤色）
 *           - ファイルの登録上限と一致した場合
 *             - 追加ボタン非表示
 *             - ドラッグ & ドロップ不可（イベント無効化）
 *             - カーソル変更（no-drop）
 *             - 背景色変更なし
 *         - ファイル単位
 *           - ファイルのサイズ上限を超えた場合
 *           - サポートしていないファイルのサイズ上限を超えた場合
 *
 * NOTE: ファイルの重複チェックはやらない（厳密性を求めることができないため）
 * NOTE: ファイルの破損チェックはやらない（厳密性を求めることができないため）
 *
 * ロジック
 * TODO: 一括の公開範囲、個別の公開範囲の優先度を検討
 *       - 公開で全適用ON > 個別の公開はそのまま、非公開は公開に変更?
 *       - 非公開で全適用ON > 個別の公開は非公開に変更、非公開はそのまま?
 * TODO: タグ情報の出し方を検討
 *       ユースケースを洗い出して検討した方が良さそう
 */
const Page = () => {
  const methods = useForm<InputFormValues>({
    resolver: zodResolver(inputFormSchema),
    mode: "onChange",
    defaultValues: {
      bulk: {
        tags: [],
      },
      images: [],
    },
  })

  const { getValues, setValue, handleSubmit } = methods

  const feedback = useFeedbackContext()

  const watchValueImages = useWatch({
    control: methods.control,
    name: "images",
  })

  const { fields, append, remove, replace } = useFieldArray({
    control: methods.control,
    name: "images",
  })

  const [uploadImage] = useUploadImageMutation()
  const manager = useTaskManager({
    mode: "parallel",
  })

  const inputValid = async (values: InputFormValues) => {
    console.log("submit values:", values)
    await manager.action.submit(async (task) => {
      const image = values.images.find((image) => task.id === image.id)

      if (!image) {
        return { status: "error", error: Error("image form data not found.") }
      }

      if (!image.selectable) {
        return { status: "skip" }
      }

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

  const inputInvalid = async (errors: FieldErrors<InputFormValues>) => {
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
        break;
    }
  }, [manager.value.meta.result])

  useEffect(() => {
    console.debug("debug task manager", {
      tasks: manager.value.tasks,
      summary: manager.value.meta.summary,
    })
  }, [manager.value.tasks])

  const addFiles = (files: FileList) => {
    const images: ImageValues[] = []
    const tasks: Task[] = []
    for (let i = 0; i < files.length; i++) {
      const id = nanoid()
      images.push({ id, selectable: true, file: files[i], tags: [] })
      tasks.push({ id, status: "idle" })
    }
    append(images)
    manager.action.append(tasks)
  }

  const removeFile = (index: number, id: string) => {
    remove(index)
    manager.action.remove([id])
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
    return imageConfig.count.max <= watchValueImages.length
  }, [watchValueImages])

  const imageDropFormValid = useMemo(() => {
    if (imageConfig.count.max < watchValueImages.length) {
      return "reject"
    }

    const empty = 0
    if (empty < fields.length) {
      if (methods.formState.isValid) {
        return "warning"
      }
    }

    return "idle"
  }, [methods, fields, watchValueImages])

  const disabled = fields.length === 0

  // const previews = fields.map((preview, index) => {
  //   const task = task.value.tasks[index]
  //   return (
  //     <Controller
  //       key={preview.id}
  //       control={methods.control}
  //       name={`images.${index}.file`}
  //       render={({ field, fieldState }) => {
  //         const rhfFieldState = rhf.fieldState(fieldState)
  //         return (
  //           <ImageDropForm.PreviewImageBox
  //             key={preview.id}
  //             index={index}
  //             id={task.id}
  //             payload={{
  //               src: URL.createObjectURL(field.value),
  //               alt: field.value.name,
  //             }}
  //             ui={{
  //               selected:
  //                 formSwitcher.state.mode === MODE.TYPE.SINGLE
  //                   ? selected === index
  //                   : false,
  //               selectable: formSwitcher.state.mode === MODE.TYPE.SINGLE,
  //               supported: !rhfFieldState.error.message.match(
  //                 "validate.file.type.unsupported",
  //               ),
  //               valid: rhfFieldState.error.message.match(
  //                 "validate.file.size.tooLarge",
  //               )
  //                 ? "warning"
  //                 : "idle",
  //               error: rhfFieldState.error.message.resolver(locale.t),
  //             }}
  //             handler={{
  //               onSelect: handleFileSelected,
  //               onRemove: fileRemove,
  //             }}
  //           />
  //         )
  //       }}
  //     />
  //   )
  // })

  return (
    <Box>
      <ImageDropForm
        ui={{
          valid: imageDropFormValid,
          disabled: imageDropFormDisabled,
        }}
        onFileDrop={handleFileDrop}
        mb="xl"
      >
        <ImageDropForm.AddImageBox
          ui={{
            valid: imageDropFormValid,
            disabled: imageDropFormDisabled,
          }}
          onFileSelect={handleFileSelect}
          config={imageConfig}
        />
      </ImageDropForm>
      <ActionPanel mb="sm">
        <ActionPanel.Left>
          <Flex align="center" gap="xs" w="100%">
            <Controller
              control={methods.control}
              name={`bulk.tags`}
              render={({ field }) => {
                return (
                  <TagsInput
                    size="xs"
                    flex="1"
                    styles={{
                      root: { height: "100%" },
                      wrapper: { height: "100%" },
                      input: { height: "100%" },
                    }}
                    {...field}
                    placeholder="タグ"
                    clearable
                  />
                )
              }}
            />
            <ButtonGroup>
              <Button size="xs" type="button" disabled={disabled} onClick={handleAddTags}>
                追加
              </Button>
              <Button size="xs" type="button" disabled={disabled} onClick={handleRemoveTags}>
                除去
              </Button>
              <Button size="xs" type="button" disabled={disabled} onClick={handleReplaceTags}>
                置換
              </Button>
            </ButtonGroup>
          </Flex>
        </ActionPanel.Left>
        <ActionPanel.Right>
          <ButtonGroup>
            <Button size="xs" type="submit" color="green" form="new-image" disabled={disabled}>
              登録
            </Button>
            <Button size="xs" type="button" disabled={disabled} onClick={handleRemoveFiles}>
              すべて取消
            </Button>
          </ButtonGroup>
        </ActionPanel.Right>
      </ActionPanel>

      <form id="new-image" onSubmit={handleSubmit(inputValid, inputInvalid)}>
        <Divider />
        <ScrollArea h={"500px"} scrollbarSize={6}>
          <Stack mb="xs" gap={0}>
            {fields.map((image, index) => {
              return (
                <React.Fragment key={image.id}>
                  <Box p="xs">
                    <Flex gap="xs">
                      <PreviewImageBox
                        ui={{
                          outline: true
                        }}
                      >
                        <Controller
                          control={methods.control}
                          name={`images.${index}.selectable`}
                          render={({ field }) => {
                            const { value, ...rest } = field
                            return (
                              <PreviewImageBox.SelectableCheckbox {...rest} checked={value} />
                            )
                          }} />
                        <Controller
                          control={methods.control}
                          name={`images.${index}.file`}
                          render={({ field }) => {
                            return (
                              <PreviewImageBox.Image
                                src={URL.createObjectURL(field.value)}
                                alt={field.value.name}
                              />
                            )
                          }}
                        />

                      </PreviewImageBox>
                      <Divider orientation="vertical" />
                      <Box
                        style={(theme) => ({
                          display: "grid",
                          gridTemplateColumns: "auto 1fr",
                          gridTemplateRows: "auto auto 1fr",
                          flex: 1,
                          gap: theme.spacing.xs,
                          alignContent: "start",
                        })}
                      >
                        <Box>
                          <Text size="xs">ファイル名</Text>
                        </Box>
                        <Box>
                          <Text size="xs">{image.file.name}</Text>
                        </Box>
                        <Box>
                          <Text size="xs">ファイルサイズ</Text>
                        </Box>
                        <Box>
                          <Text size="xs">{image.file.size}</Text>
                        </Box>
                        <Box>
                          <Text size="xs">タグ</Text>
                        </Box>
                        <Box>
                          <Controller
                            control={methods.control}
                            name={`images.${index}.tags`}
                            render={({ field }) => {
                              return (
                                <TagsInput
                                  size="xs"
                                  styles={{
                                    root: { height: "100%" },
                                    wrapper: { height: "100%" },
                                    input: { height: "100%" },
                                  }}
                                  {...field}
                                  clearable
                                />
                              )
                            }}
                          />
                        </Box>
                      </Box>
                      <Divider orientation="vertical" />
                      <Box style={{ display: "flex", alignItems: "center" }}>
                        <Button
                          size="xs"
                          type="button"
                          onClick={() => removeFile(index, image.id)}
                        >
                          取消
                        </Button>
                      </Box>
                    </Flex>
                  </Box>
                  <Divider />
                </React.Fragment>
              )
            })}
          </Stack>
        </ScrollArea>
        <Divider />
      </form>
    </Box>
  )
}

export default Page

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
