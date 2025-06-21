import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { authConfig } from "@/config/auth";

export const AuthGuard = async () => {
  const session = await auth.getSession();

  if (!session) {
    redirect(authConfig.signedOut.redirect);
  }
  return null;
};
