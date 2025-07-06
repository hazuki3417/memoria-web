import { NotificationData } from "@mantine/notifications";

export type NotificationTypeData = Omit<NotificationData, "color">;
export type NotificationType = "success" | "info" | "warning" | "error";

export const createNotificationTypeData = (
  type: NotificationType,
  data: NotificationTypeData,
): NotificationData => {
  switch (type) {
    case "success":
      return {
        ...data,
        color: "green",
      };
    case "info":
      return {
        ...data,
        color: "blue",
      };
    case "warning":
      return {
        ...data,
        color: "yellow",
      };
    case "error":
      return {
        ...data,
        color: "red",
      };
  }
};
