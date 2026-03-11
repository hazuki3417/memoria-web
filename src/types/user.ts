import { Limit } from "./limit"
import { Preference } from "./preference"

export type User = {
  id: string
  limit: Limit
  preference: Preference
}
