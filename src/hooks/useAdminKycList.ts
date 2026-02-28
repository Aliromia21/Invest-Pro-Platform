import { useQuery } from "@tanstack/react-query";
import { fetchAdminKycList, type AdminKycItem } from "@/api/admin/kyc";
import { fetchAdminUser, type AdminUser } from "@/api/admin/users";

export type AdminKycRow = AdminKycItem & {
  user?: AdminUser | null;
};

export function useAdminKycList() {
  return useQuery({
    queryKey: ["admin-kyc-list"],
    queryFn: async (): Promise<AdminKycRow[]> => {
      const kycs = await fetchAdminKycList();

      const uniqueUserIds = Array.from(new Set(kycs.map((k) => k.user_id)));

      const usersPairs = await Promise.all(
        uniqueUserIds.map(async (id) => {
          try {
            const u = await fetchAdminUser(id);
            return [id, u] as const;
          } catch {
            return [id, null] as const;
          }
        })
      );

      const userMap = new Map<number, AdminUser | null>(usersPairs);

      return kycs.map((k) => ({
        ...k,
        user: userMap.get(k.user_id) ?? null,
      }));
    },
    staleTime: 10_000,
  });
}
