import { resolveUri } from "../url"

const routes = [
  resolveUri("/dashboard"),
  resolveUri("/images"),
  resolveUri("/settings"),
]

export const isProtectedRoute = (pathname: string) => {
  return routes.some((route) => pathname.startsWith(route))
}

export const redirectLogin = (pathname: string, requestUrl: string) => {
  const loginUrl = new URL(resolveUri("/auth/login"), requestUrl)
  loginUrl.searchParams.set("returnTo", pathname)
  return loginUrl
}
