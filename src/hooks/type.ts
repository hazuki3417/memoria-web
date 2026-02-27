export type BaseActionStateType = "idle"
export type ActionStateType<T extends string> = BaseActionStateType | T
