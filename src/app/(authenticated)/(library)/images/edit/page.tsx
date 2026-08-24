"use client"
import { ActionPanel, FieldValid } from "@/components"
import { useGetEditImagesQuery, useUpdateImageMutation } from "@/graphql"
import { usePreference, useTaskManager, useUriQuery } from "@/hooks"
import { wait } from "@/lib/wait"
import { useFeedbackContext, useUserContext } from "@/providers"
import { Task, TaskValue } from "@/reducers"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box, Button, Divider } from "@mantine/core"
import { t } from "i18next"
import React, { useEffect } from "react"
import { FieldErrors, useForm, useWatch } from "react-hook-form"
import {
  ImageInputForm,
  ImageInputFormValues,
  ImageValues,
  useImageInputFormSchema,
} from "../_components"

const Page = () => {
  const query = useUriQuery<{ targets: string[] }>()

  const user = useUserContext()
  const preference = usePreference()

  const manager = useTaskManager({ mode: "parallel" })
  const feedback = useFeedbackContext()

  const inputSchema = useImageInputFormSchema(user.limit)

  const methods = useForm<ImageInputFormValues>({
    resolver: zodResolver(inputSchema),
    mode: "onChange",
    defaultValues: {
      bulk: {
        reflection: true,
        tags: [],
      },
      images: [],
    },
  })
  const { reset } = methods

  const images = useWatch({
    control: methods.control,
    name: "images",
  })

  const { data } = useGetEditImagesQuery({
    variables: {
      ids: query?.targets || [],
    },
  })

  const [updateImage] = useUpdateImageMutation()

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

      await updateImage({
        variables: {
          input: {
            id: image.taskId,
            tags: image.tags,
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
          title: "更新",
          body: "更新処理を開始しました。",
        })
        return
      case "success":
        feedback.action.success({
          title: "更新",
          body: "正常に終了しました。",
        })
        // resetFiles()
        // form reset （アイテムのみ）
        return
      case "partial-success":
        feedback.action.warning({
          title: "更新",
          body: "一部更新に失敗しました。",
        })
        // 成功したものみformをdisabledする
        return
      case "error":
        feedback.action.warning({
          title: "更新",
          body: "更新に失敗しました。",
        })
        return
      case "idle":
      default:
        break
    }
  }, [manager.value.meta.result])

  const allFormDisabled = (() => {
    if (manager.value.meta.result === "running") {
      return true
    }
    return false
  })()

  useEffect(() => {
    if (!data) {
      return
    }
    const origin = data.imagesByIds

    const images: ImageValues[] = []
    const tasks: Task[] = []
    for (let i = 0; i < origin.length; i++) {
      const taskId = origin[i].id
      images.push({
        type: "existing",
        taskId: taskId,
        selected: true,
        preview: {
          src: origin[i].src.thumbnail,
          name: origin[i].file.name,
          size: origin[i].file.size,
        },
        tags: origin[i].tags,
      })
      tasks.push({ id: taskId, status: "idle" })
    }

    reset((prev) => ({
      ...prev,
      images: images,
    }))
    manager.action.append(tasks)
  }, [data])

  return (
    <Box
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <ImageInputForm
        mode="edit"
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
        <ImageInputForm.BulkActionPanel />
        <ImageInputForm.Container>
          {images.map((image, index) => {
            const task = manager.value.tasks.find(
              (task) => image.taskId === task.id,
            )
            const itemDisabled = task?.status === "success"
            return (
              <React.Fragment key={image.taskId}>
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
                />
                <Divider />
              </React.Fragment>
            )
          })}
        </ImageInputForm.Container>
        <Divider />
        <ActionPanel mt="xs">
          <ActionPanel.Left />
          <ActionPanel.Center />
          <ActionPanel.Right>
            <Button type="submit" size="xs">
              {t("button.update")}
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
