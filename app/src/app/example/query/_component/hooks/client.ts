"use client";
import { GetContentDocument, GetUserDocument, graphql } from "@/graphql";
import {
  type QueryHookOptions,
  type QueryResult,
  useQuery,
} from "@apollo/client";
import { GQL } from "./gql";
import type { Content, Input } from "./type";

type Result = QueryResult<Content, Input>;

/**
 * 更に汎用的に利用できるよう以下の型とプロパティを外部から指定できるようにする
 * - property: GQL
 * - type: Input, Content
 */

const useData = (options: QueryHookOptions<Content, Input>) => {
  // graphql側で定義したクエリをそのまま利用
  const aa = useQuery(GetContentDocument, { variables: { id: "1" } });
  // aa.data?.content.

  const ii = useQuery(GetUserDocument, { variables: { id: "1" } });
  // ii.data?.content.

  // 基本的にgraphqlを呼び出す側でgraphqlのoperationを定義する
  // 定義したらnpm run codegenでgrapqhに関するコードを生成する
  // コード側では生成したopeartion documentを利用する。
  // 直接operationは書かない。必ずgraphqlのoperation documentをを定義する
  // operation documentは1箇所に集約ではなく、ドメインのディレクトリ側に配置する
  // ドメイン駆動なので、ディレクトリの粒度もドメイン方がわかりやすい
  // 生成したコードのopeartion documentをuseQueryに渡すだけで、inputとoutputの型が自動で設定される
  // -> apollo clientの実装は楽になる

  // TODO: formと表示系の型をどう関連付けるか
  // output formはバックエンドから取得した情報を当てる = バックエンドが基準
  // なのでコンポーネントはバックエンドの型に依存するでよい

  // input formは画面が基準
  // なので可能であればバックエンドは画面の型に依存するのがよいが、そうはいかない？

  // 多分各入力フォームの値の扱い方を洗い出す必要がありそう
  // 例）select boxの単一選択時の値の扱い方、複数選択なら配列形式なるのかとか
  // 例）datePickerの値はDate側で扱われているのか、stringで扱われているのか
  // 上記のよって、フロントからバックエンドに渡すデータは変換が必要になる
  // あとは複数のチェックボックスがあるときとか、ラジオボタンのときとか

  return useQuery<Content, Input>(GQL, options);
};

export default useData;
export type { Result };
