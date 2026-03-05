"use client"
import { imageConfig } from "@/config"
import {
  ImageDropForm,
  imageFormDefaultValue,
  imageFormSchema,
} from "@/feature/images/new"
import { useUploadImageMutation, Visibility } from "@/graphql"
import { useTaskManager } from "@/hooks"
import { zod } from "@/lib"
import { Task } from "@/reducers"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box } from "@mantine/core"
import { nanoid } from "nanoid"
import { useCallback, useMemo } from "react"
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormState,
  useWatch
} from "react-hook-form"
import { z } from "zod"

const fileSchema = z.object({
  file: zod.refine(
    z.custom<File>((file) => file instanceof File),
    [
      zod.validate.file.type(imageConfig.type),
      zod.validate.file.size.tooLarge(imageConfig.size.max),
    ],
  ),
})

const imageSchema = imageFormSchema.merge(fileSchema)

const inputFormSchema = z.object({
  share: imageFormSchema,
  images: z.array(imageSchema).max(imageConfig.count.max),
})
type ImageSchema = z.infer<typeof imageSchema>
type FormSchema = z.infer<typeof inputFormSchema>

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
  const methods = useForm<FormSchema>({
    resolver: zodResolver(inputFormSchema),
    mode: "onChange",
    defaultValues: {
      share: imageFormDefaultValue,
      images: [],
    },
  })

  const watchValueImages = useWatch({
    control: methods.control,
    name: "images",
  })

  const watchStateImages = useFormState({
    control: methods.control,
    name: "images",
  })

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "images",
  })

  const [uploadImage] = useUploadImageMutation()

  const taskManager = useTaskManager({
    mode: "parallel",
    failOnError: false,
  })


  const submit = async () => {
    await methods.handleSubmit(async (value, errors) => {
      await taskManager.action.submit(async (task, index) => {
        const image = methods.getValues("images")[index]
        await uploadImage({
          variables: {
            input: {
              ...image,
              visibility: Visibility.Private,
            },
          },
        })
      })
    })()
  }

  const addFiles = (files: FileList) => {
    const newTasks: Task[] = []
    const newImages: ImageSchema[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      newTasks.push({
        id: nanoid(),
        status: "idle",
      })

      newImages.push({
        file,
        ...imageFormDefaultValue,
      })
    }

    // まとめて更新
    taskManager.action.append(newTasks)
    append(newImages)
    // NOTE: バリデーションを発火させる
    methods.trigger()
  }

  const fileDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    addFiles(event.dataTransfer.files)
  }, [])

  const fileSelect = useCallback((newFiles: FileList | null) => {
    if (newFiles === null) {
      return
    }
    addFiles(newFiles)
  }, [])

  const fileRemove = useCallback(
    (index: number, id: string) => {
      taskManager.action.remove([id])
      remove(index)
    },
    [fields],
  )

  const imageDropFormValid = useMemo(() => {
    if (imageConfig.count.max < watchValueImages.length) {
      return "reject"
    }

    const empty = 0;
    if (empty < fields.length) {
      if (methods.formState.isValid) {
        return "warning";
      }
    }

    return "idle"
  }, [methods, fields, watchValueImages])

  const imageDropFormDisabled = useMemo(() => {
    return imageConfig.count.max <= watchValueImages.length
  }, [watchValueImages])

  const isEmpty = useMemo(() => {
    const empty = 0
    return fields.length <= empty
  }, [fields])


  // const previews = fields.map((preview, index) => {
  //   const task = taskManager.value.tasks[index]
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
  //               onSelect: fileSelected,
  //               onRemove: fileRemove,
  //             }}
  //           />
  //         )
  //       }}
  //     />
  //   )
  // })

  return (
    <Box
      style={(theme) => ({
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      })}
    >
      <FormProvider {...methods}>
        <Box
          style={(theme) => ({
            backgroundColor: theme.colors.dark[7],
            borderBottom: `1px solid ${theme.colors.dark[8]}`,
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
          })}
        >
        </Box>
      </FormProvider>

      <ImageDropForm
        ui={{
          valid: imageDropFormValid,
          disabled: imageDropFormDisabled,
        }}
        error={watchStateImages.errors.images?.message}
        onFileDrop={fileDrop}
      >
        {watchValueImages.length < imageConfig.count.max && (
          <ImageDropForm.AddImageBox
            config={imageConfig}
            handler={{
              onFileSelect: fileSelect,
            }}
            ui={{
              valid: imageDropFormValid,
            }}
          />
        )}
      </ImageDropForm>
    </Box>
  )
}

export default Page
