"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/providers/AppProvider/AppProvider";

type RequireAuthProps = {
  children: React.ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const { hydrated, user } = useAppContext();

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/auth");
    }
  }, [hydrated, router, user]);

  if (!hydrated || !user) {
    return null;
  }

  return <>{children}</>;
}
