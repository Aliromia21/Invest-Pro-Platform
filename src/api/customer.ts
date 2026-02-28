import { api } from "../api/api";

export const getCustomerInvestments = async () => {
  const res = await api.get("/customer/investments/");
  return res.data;
};
