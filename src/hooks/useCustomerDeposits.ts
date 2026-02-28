import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCustomerDepositRequest,
  fetchCustomerDepositRequests,
  type CustomerDepositRequest,
} from "@/api/customer/deposits";

export function useCustomerDeposits() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["customer-deposits"],
    queryFn: fetchCustomerDepositRequests,
    staleTime: 10_000,
  });

  const create = useMutation({
    mutationFn: createCustomerDepositRequest,
    onSuccess: (newReq) => {
      qc.setQueryData<CustomerDepositRequest[]>(
        ["customer-deposits"],
        (old = []) => [newReq, ...old]
      );
    },
  });

  return { list, create };
}
