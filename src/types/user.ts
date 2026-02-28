
export type { User, ApiResponse } from "./api";

export type LoginData = {
  access: string;
  refresh: string;
  user?: import("./api").User;
};
