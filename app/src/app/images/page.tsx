"use client";
import { Box, Button, Flex, Group, Paper, Stack, Text } from "@mantine/core";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormState,
  useWatch,
} from "react-hook-form";
import {
  ImageInputForm,
  imageFormDefaultValue,
  imageFormSchema,
} from "./ImageInputForm";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormSwitcher, FormSwitcher, MODE } from "./FormSwitcher";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageDropForm } from "./ImageDropForm";
import { imageConfig } from "@/config";
import { formatSize } from "@/lib/utils";
import { useUploadImageMutation, Visibility } from "@/graphql";
import { useTaskManager } from "@/hooks/useTaskManager";
import { Task } from "@/reducers";
import { nanoid } from "nanoid";
import { render } from "@testing-library/react";

const validFile = (file: File) => {
  return {
    size: file.size <= imageConfig.size.max,
    type: imageConfig.type.includes(file.type),
  };
};

const fileSchema = z.object({
  file: z
    .custom<File>((file) => file instanceof File)
    .refine((file) => validFile(file).size, {
      message: "ファイルサイズが50MBを超えています",
    })
    .refine((file) => validFile(file).type, {
      message: "対応していないファイル形式です",
    }),
});

const imageSchema = imageFormSchema.merge(fileSchema);

const inputFormSchema = z.object({
  share: imageFormSchema,
  images: z.array(imageSchema).max(imageConfig.count.max),
});
type ImageSchema = z.infer<typeof imageSchema>;
type FormSchema = z.infer<typeof inputFormSchema>;

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
 * TODO: ファイルサイズの上限を検討（全体）
 * TODO: 一括の公開範囲、個別の公開範囲の優先度を検討
 *       - 公開で全適用ON > 個別の公開はそのまま、非公開は公開に変更?
 *       - 非公開で全適用ON > 個別の公開は非公開に変更、非公開はそのまま?
 * TODO: タグ情報の出し方を検討
 *       ユースケースを洗い出して検討した方が良さそう
 *
 * UI
 * TODO: ファイルドラッグ時に対応しているバリデーションOKなら背景色を青に、違反なら赤にする
 */
export default function Page() {
  const formSwitcher = useFormSwitcher();
  const methods = useForm<FormSchema>({
    resolver: zodResolver(inputFormSchema),
    mode: "onChange",
    defaultValues: {
      share: imageFormDefaultValue,
      images: [],
    },
  });

  const watchValueImages = useWatch({
    control: methods.control,
    name: "images",
  });

  const watchStateImages = useFormState({
    control: methods.control,
    name: "images",
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "images",
  });

  const [fileValid, setFileValid] = useState<
    { size: boolean; type: boolean }[]
  >([]);

  const [uploadImage] = useUploadImageMutation();

  const taskManager = useTaskManager({
    mode: "parallel",
    failOnError: false,
  });

  const [selected, setSelected] = useState<number | null>(null);

  const [total, setTotal] = useState<number>(0);

  const submit = async () => {
    console.debug("submit", methods.formState.errors);
    await methods.handleSubmit(async (value, errors) => {
      console.debug("handleSubmit", { value, errors });
      await taskManager.handler.submit(async (task, index) => {
        const image = methods.getValues("images")[index];
        await uploadImage({
          variables: {
            input: {
              ...image,
              visibility:
                image.visibility === "public"
                  ? Visibility.Public
                  : Visibility.Private,
            },
          },
        });
      });
    })();
  };

  const addFiles = (files: FileList) => {
    const newFileValids: { size: boolean; type: boolean }[] = [];
    const newTasks: Task[] = [];
    const newImages: ImageSchema[] = [];
    let total = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const valid = validFile(file);

      total += file.size;
      newFileValids.push(valid);
      newTasks.push({
        id: nanoid(),
        status: "idle",
      });

      newImages.push({
        file,
        ...imageFormDefaultValue,
      });
    }

    // まとめて更新
    setTotal((prev) => prev + total);
    setFileValid((prev) => [...prev, ...newFileValids]);
    taskManager.handler.append(newTasks);
    append(newImages);
    // NOTE: バリデーションを発火させる
    methods.trigger();
  };

  const fileDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  }, []);

  const fileSelect = useCallback((newFiles: FileList | null) => {
    if (newFiles === null) {
      return;
    }
    addFiles(newFiles);
  }, []);

  const fileSelected = useCallback((index: number, id: string) => {
    setSelected(index);
  }, []);

  const fileRemove = useCallback(
    (index: number, id: string) => {
      setTotal((prev) => {
        const file = fields[index].file;
        return prev - file.size;
      });

      setFileValid((prev) => prev.filter((_, i) => i !== index));

      taskManager.handler.remove([id]);
      remove(index);
    },
    [fields],
  );

  const imageDropFormValid = useMemo(() => {
    if (imageConfig.count.max < watchValueImages.length) {
      return "reject";
    }

    const empty = 0;
    if (empty < fileValid.length) {
      const size = fileValid.some((file) => file.size === false);
      const type = fileValid.some((file) => file.type === false);
      if (size || type) {
        return "warning";
      }
    }

    return "idle";
  }, [fileValid, watchValueImages]);

  const imageDropFormDisabled = useMemo(() => {
    return imageConfig.count.max <= watchValueImages.length;
  }, [watchValueImages]);

  const totalSize = useMemo(() => {
    return formatSize(total, "m");
  }, [total]);

  const isEmpty = useMemo(() => {
    const empty = 0;
    return fields.length <= empty;
  }, [fields]);

  useEffect(() => {
    /**
     * 一括フォーム状態のとき > サムネイルを未選択状態にする
     * 個別フォーム状態のとき > サムネイルを選択状態にする
     */
    if (formSwitcher.state.mode === MODE.TYPE.ALL) {
      setSelected(null);
      return;
    }
    setSelected(0);
  }, [formSwitcher.state.mode]);

  const previews = fields.map((preview, index) => {
    const task = taskManager.state.tasks[index];
    const key = task.id;
    return (
      <Controller
        key={key}
        control={methods.control}
        name={`images.${index}.file`}
        render={({ field, fieldState }) => (
          <ImageDropForm.PreviewImageBox
            key={key}
            index={index}
            id={task.id}
            payload={{
              src: URL.createObjectURL(field.value),
              alt: field.value.name,
            }}
            ui={{
              selected:
                formSwitcher.state.mode === MODE.TYPE.SINGLE
                  ? selected === index
                  : false,
              selectable: formSwitcher.state.mode === MODE.TYPE.SINGLE,
              supported: fileValid[index].type,
              valid: fileValid[index].size ? "idle" : "warning",
              error: fieldState.error?.message,
            }}
            handler={{
              onSelect: fileSelected,
              onRemove: fileRemove,
            }}
          />
        )}
      />
    );
  });

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
          <FormSwitcher value={formSwitcher}>
            <Stack>
              <Flex
                style={{
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <FormSwitcher.SegmentedControl
                  ui={{
                    disabled: {
                      all: false,
                      single: 0 === watchValueImages.length,
                    },
                  }}
                />
                <Flex
                  gap={8}
                  style={{
                    alignItems: "center",
                  }}
                >
                  <Text size="sm">{`${watchValueImages.length} 件`}</Text>
                  <Text size="sm">{`${Math.round(totalSize.value)} ${totalSize.unit.toUpperCase()}B`}</Text>
                  <Button size="xs" onClick={submit} disabled={isEmpty}>
                    登録
                  </Button>
                </Flex>
              </Flex>
              <Box>
                <FormSwitcher.All>
                  <ImageInputForm control={methods.control} prefix="share" />
                </FormSwitcher.All>
                <FormSwitcher.Single>
                  <ImageInputForm
                    // NOTE: keyを指定することでreact-hook-formのcontrollerも更新されるようにしている
                    key={`images.${selected}`}
                    control={methods.control}
                    prefix={`images.${selected}`}
                  />
                </FormSwitcher.Single>
              </Box>
            </Stack>
          </FormSwitcher>
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
        {previews}
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
      {taskManager.state.tasks.map((task, index) => (
        <Paper key={index} p="xs" withBorder radius="md">
          <Group justify="space-between">
            <Text size="sm">{task.id}</Text>
            <Text size="sm" c={task.status === "error" ? "red" : "dimmed"}>
              {task.status}
            </Text>
          </Group>
          {task.status === "error" && (
            <Text size="xs" c="red">
              エラー: {task.error}
            </Text>
          )}
        </Paper>
      ))}
    </Box>
  );
}
