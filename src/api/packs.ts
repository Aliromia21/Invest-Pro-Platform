import { api } from "./client";

export function getCustomerPacks() {
  return api.get("customer/packs/");
}
