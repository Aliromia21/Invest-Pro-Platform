import { api } from "../api/api";

export const getCustomerTransactions = async () => {
  const res = await api.get("/customer/transactions/");
  return res.data;
};
