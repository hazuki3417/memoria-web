"use client";
import { authConfig } from "@/config/auth";
import { useAuth } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const AuthGuard = () => {
  const user = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) {
      router.push(authConfig.signedOut.redirect);
    }
  }, [user]);

  return null;
};
