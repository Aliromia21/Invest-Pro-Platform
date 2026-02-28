import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCustomerKyc, submitCustomerKyc, CustomerKyc } from "@/api/customer/kyc";

export function useCustomerKyc() {
  const qc = useQueryClient();

  const query = useQuery<CustomerKyc | null>({
    queryKey: ["customerKyc"],
    queryFn: fetchCustomerKyc,
  });

  const submit = useMutation({
    mutationFn: submitCustomerKyc,
    onSuccess: (data) => {
      qc.setQueryData(["customerKyc"], data);
    },
  });

  return { query, submit };
}
