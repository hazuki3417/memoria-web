import { routes } from "@/constants/routes";
import { RouteNode, RouteNodes } from "@/types/routes";
import { isParamSegment } from "./url";

export const resoluveRoutes = (path: string) => {
  const segments = path.split("/").filter(Boolean);

  const result: RouteNode[] = [];

  let currentNodes: Readonly<RouteNodes> | undefined = routes;

  for (const segment of segments) {
    if (!currentNodes) break;

    const node = Object.values(currentNodes).find((node) => {
      // 完全一致
      if (node.segment === segment) return true;

      // パスパラメータ（:id など）
      if (isParamSegment(node.segment)) return true;

      return false;
    });

    if (!node) break;

    result.push(node);

    currentNodes = node.children as Readonly<RouteNodes> | undefined;
  }

  return result;
};
