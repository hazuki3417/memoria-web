/**
 * 一致しないaction.typeを指定したときに投げる例外を生成します
 * @param x action
 * @returns 例外を返します
 */
export const assertUnreachableActionType = (x: never): Error => {
  const type = (x as { type?: unknown }).type;
  return new Error(`Unhandled action type: ${type}`);
};

export type BaseActionType = "idle";
export type ActionType<T extends string> = BaseActionType | T;
