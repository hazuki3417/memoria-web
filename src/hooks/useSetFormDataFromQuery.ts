import { Exact } from "@/graphql";
import { QueryResult } from "@apollo/client";
import { useEffect, useMemo } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

export type UseSetFormDataFromQueryOption<
  TData,
  TFormValues extends FieldValues,
> = {
  query: QueryResult<
    TData,
    Exact<{
      [key: string]: never;
    }>
  >;
  form: UseFormReturn<TFormValues>;
  selector: (data: TData) => TFormValues | undefined;
};

export const useSetFormDataFromQuery = <TData, TFormValues extends FieldValues>(
  option: UseSetFormDataFromQueryOption<TData, TFormValues>,
) => {
  /**
   * NOTE: fetchが成功したときのみ値を設定する
   */
  const { query, form, selector } = option;

  /**
   * NOTE: useEffectの発火回数を最小限にするため
   *       発火条件を計算してuseEffectの依存配列に指定する
   */
  const trigger = useMemo(() => {
    // NOTE: fetchが成功したときのみtrueを返す
    if (
      query.loading === false &&
      query.error === undefined &&
      query.data !== undefined
    ) {
      return true;
    }
    return false;
  }, [query.loading, query.error, query.data]);

  useEffect(() => {
    /**
     * NOTE: triggerの条件でquery.dataの存在は保証されている。
     *       万が一条件が変わったりした場合に備えて防御的にチェックを残す
     */
    if (query.data) {
      const selected = selector(query.data);
      if (selected) {
        form.reset(selected);
      }
    }
  }, [trigger]);
};
