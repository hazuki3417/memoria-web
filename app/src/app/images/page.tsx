"use client";
import { Box, Button, Stack } from "@mantine/core";
import {
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
import { PreviewImageBoxType } from "./ImageDropForm/PreviewImageBox";

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

const inputFormSchema = z.object({
  share: imageFormSchema,
  images: z.array(imageFormSchema.merge(fileSchema)).max(imageConfig.count.max),
});

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

  const [previewImageBoxType, setPreviewImageBoxType] = useState<
    PreviewImageBoxType[]
  >([]);
  const [selected, setSelected] = useState<number | null>(null);

  const addFiles = (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const valid = validFile(file);

      console.debug("valid", valid);
      setPreviewImageBoxType((prev) => {
        if (!valid.type) {
          return [...prev, "unsupported"];
        }
        if (!valid.size) {
          return [...prev, "invalid"];
        }
        return [...prev, "valid"];
      });

      append({
        file,
        ...imageFormDefaultValue,
      });
    }
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

  const fileSelected = useCallback((value: number) => {
    setSelected(value);
  }, []);

  const fileRemove = useCallback((value: number) => {
    setPreviewImageBoxType((prev) =>
      prev.filter((_, index) => index !== value),
    );
    remove(value);
  }, []);

  const imageDropFormWarning = useMemo(() => {
    return previewImageBoxType.some((type) => type !== "valid");
  }, [previewImageBoxType]);

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
    const type = previewImageBoxType[index];
    return (
      <ImageDropForm.PreviewImageBox
        ui={{ type }}
        key={index}
        id={index}
        selected={
          formSwitcher.state.mode === MODE.TYPE.SINGLE
            ? selected === index
            : false
        }
        selectable={formSwitcher.state.mode === MODE.TYPE.SINGLE}
        src={
          type !== "unsupported" ? URL.createObjectURL(preview.file) : undefined
        }
        alt={type !== "unsupported" ? preview.file.name : undefined}
        onSelect={fileSelected}
        onRemove={fileRemove}
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
              <Box>
                <FormSwitcher.SegmentedControl
                  ui={{
                    disabled: {
                      all: false,
                      single: 0 === watchValueImages.length,
                    },
                  }}
                />
              </Box>
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
          accept: false,
          warning: imageDropFormWarning,
          reject: false,
          disabled: imageConfig.count.max <= watchValueImages.length,
        }}
        error={watchStateImages.errors.images?.message}
        onFileDrop={fileDrop}
      >
        {previews}
        {watchValueImages.length < imageConfig.count.max && (
          <ImageDropForm.AddImageBox onFileSelect={fileSelect} />
        )}
      </ImageDropForm>
      <Button onClick={() => console.debug("submit", methods.getValues())}>
        submit
      </Button>
    </Box>
  );
}
