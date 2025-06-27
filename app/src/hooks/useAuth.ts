import { AuthContext } from "@/providers";
import { useContext } from "react";

export const useAuth = () => {
  return useContext(AuthContext);
};
