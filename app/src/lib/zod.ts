import { z, ZodIssueCode } from "zod";

// z.setErrorMap((issue, ctx) => {
//   const messages: Partial<Record<ZodIssueCode, string>> = {
//     invalid_type: "形式が正しくありません",
//     too_small: "入力が短すぎます",
//     too_big: "入力が長すぎます",
//     invalid_enum_value: "選択肢が不正です",
//     invalid_string: "文字列の形式が不正です",
//     invalid_date: "日付が不正です",
//     custom: ctx.defaultError,
//   };
//
//   return {
//     message: messages[issue.code] ?? "無効な入力です",
//   };
// });
