import { AuthContext } from "@/providers";
import { useContext } from "react";

export const useUser = () => {
  return useContext(AuthContext);
};
