// src/hooks/useAdminUser.ts
import { useQuery } from "@tanstack/react-query";
import { fetchAdminUser } from "@/api/admin/users";

export function useAdminUser(userId: number | null, open: boolean) {
  return useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => fetchAdminUser(userId as number),
    enabled: open && !!userId,
    staleTime: 20_000,
  });
}
