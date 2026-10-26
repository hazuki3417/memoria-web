export const creationFailureDescription = (error: unknown) => {
  if (
    error &&
    typeof error === "object" &&
    "graphQLErrors" in error &&
    Array.isArray(error.graphQLErrors)
  ) {
    for (const item of error.graphQLErrors) {
      const extensions = item?.extensions
      if (extensions?.reason === "DUPLICATE_NAME")
        return "同じ名前のGroupが既にあります。名前を変更してください。"
      if (extensions?.reason === "SCOPE_LIMIT")
        return "この範囲で作成できるGroup数の上限に達しました。"
      if (extensions?.reason === "CYCLE")
        return "指定した関係によって循環が発生します。"
      if (extensions?.reason === "DEPTH_LIMIT")
        return "指定した関係ではGroup階層の深さが上限を超えます。"
      if (
        extensions?.reason === "PARENT_LIMIT" ||
        extensions?.reason === "CHILD_LIMIT"
      )
        return "指定した関係では直接のParentまたはChildの件数上限を超えます。"
      if (extensions?.code === "FORBIDDEN")
        return "この範囲のGroupを作成する権限がありません。"
      if (extensions?.code === "VALIDATION")
        return "入力した名前またはParent・Childの関係を確認してください。"
    }
  }
  return "入力内容と通信状態を確認して、もう一度お試しください。"
}
