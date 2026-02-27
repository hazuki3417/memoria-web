import { routes } from "@/constants/routes"

export type RouteNode = {
  /** URL セグメント（持たないノードも許可） */
  segment: string
  title: string
  breadcrumb: string
  tags: string[]
  children?: RouteNodes
}

export type RouteNodes = Record<string, RouteNode>

type Join<A extends string, B extends string> = A extends ""
  ? `/${B}`
  : `${A}/${B}`

type RoutePaths<T extends RouteNode, Prefix extends string = ""> =
  | (T["segment"] extends string ? Join<Prefix, T["segment"]> : never)
  | (T["children"] extends RouteNodes
      ? {
          [K in keyof T["children"]]: RoutePaths<
            T["children"][K],
            T["segment"] extends string ? Join<Prefix, T["segment"]> : Prefix
          >
        }[keyof T["children"]]
      : never)

type AllRoutePaths<T extends RouteNodes> = {
  [K in keyof T]: RoutePaths<T[K]>
}[keyof T]

export type RoutePath = AllRoutePaths<typeof routes>

export type ExtractPathParams<S extends string> =
  S extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractPathParams<`/${Rest}`>
    : S extends `${string}:${infer Param}`
      ? Param
      : never

export type PathParamsObject<S extends string> = [
  ExtractPathParams<S>,
] extends [never]
  ? {}
  : { [K in ExtractPathParams<S>]: string }
