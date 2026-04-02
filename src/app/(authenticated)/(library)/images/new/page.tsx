"use client"
import { ActionPanel, FieldValid } from "@/components"
import { useUploadImageMutation, Visibility } from "@/graphql"
import { usePreference, useTaskManager } from "@/hooks"
import { wait } from "@/lib/wait"
import { useFeedbackContext, useUserContext } from "@/providers"
import { Task, TaskValue } from "@/reducers"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box, Button, Divider, ScrollArea } from "@mantine/core"
import { t } from "i18next"
import { nanoid } from "nanoid"
import React, { useCallback, useEffect, useMemo } from "react"
import { FieldErrors, useFieldArray, useForm, useWatch } from "react-hook-form"
import {
  ImageInputForm,
  ImageInputFormValues,
  ImageValues,
  useImageInputFormSchema,
} from "../_components"
import { ImageDropForm } from "./_components"

const Page = () => {
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

  const watchValueImages = useWatch({
    control: methods.control,
    name: "images",
  })

  const { fields, append, remove, replace } = useFieldArray({
    control: methods.control,
    name: "images",
  })

  const [uploadImage] = useUploadImageMutation()

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

  const handleRemoveFiles = useCallback(() => {
    replace([])
    manager.action.reset()
  }, [manager.action.reset])

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    addFiles(event.dataTransfer.files)
  }

  const handleFileSelect = (newFiles: FileList | null) => {
    if (newFiles === null) {
      return
    }
    addFiles(newFiles)
  }

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
        <ImageInputForm.BulkActionPanel onRemoveFiles={handleRemoveFiles} />
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
