import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/adminApi";
import type { AdminSupportTicket } from "./useAdminSupportTickets";

type ApiResp<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: any;
};

export function useUpdateAdminSupportTicket() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: number;
      is_read: boolean;
    }) => {
      const { data } = await adminApi.put<
        ApiResp<AdminSupportTicket>
      >(`/admin/support-tickets/${params.id}/`, {
        is_read: params.is_read,
      });

      return data.data;
    },

    onSuccess: (updated) => {
      qc.setQueryData<any>(
        ["adminSupportTickets"],
        (old: any) => {
          if (!old?.data) return old;

          return {
            ...old,
            data: old.data.map(
              (t: AdminSupportTicket) =>
                t.id === updated.id ? updated : t
            ),
          };
        }
      );
    },
  });
}
