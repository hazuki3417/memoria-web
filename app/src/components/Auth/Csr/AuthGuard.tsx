"use client";
import { authConfig } from "@/config/auth";
import { useAuth } from "@/providers";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export const AuthGuard = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !isLoading) {
      router.push(authConfig.signedOut.redirect);
    }
  }, [user, isLoading]);

  if (user || !isLoading) {
    return <div>Loading...</div>;
  }
  return null;
};
