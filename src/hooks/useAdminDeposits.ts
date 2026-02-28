import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminDepositRequests,
  approveAdminDepositRequest,
  rejectAdminDepositRequest,
  type AdminDepositRequest,
} from "@/api/admin/deposits";

export function useAdminDeposits() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["admin-deposits"],
    queryFn: fetchAdminDepositRequests,
    staleTime: 10_000,
  });

  const approve = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      approveAdminDepositRequest(id, notes),
    onSuccess: (updated) => {
      qc.setQueryData<AdminDepositRequest[]>(
        ["admin-deposits"],
        (old = []) => old.map((r) => (r.id === updated.id ? updated : r))
      );
      window.dispatchEvent(new CustomEvent("admin-users-refresh"));
    },
  });

  const reject = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      rejectAdminDepositRequest(id, notes),
    onSuccess: (updated) => {
      qc.setQueryData<AdminDepositRequest[]>(
        ["admin-deposits"],
        (old = []) => old.map((r) => (r.id === updated.id ? updated : r))
      );
    },
  });

  return { list, approve, reject };
}
