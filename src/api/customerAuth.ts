import { api } from "@/api/client";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: any;
};

export type RegisterPayload = {
  email: string;
  password: string;
  full_name: string;
  country: string; 
  phone: string;
  referral_code?: string; 
};

export async function registerCustomer(payload: RegisterPayload) {
  const res = await api.post<ApiResponse<any>>("customer/register/", payload);
  return res.data;
}

export async function sendResetOtp(email: string) {
  const res = await api.post<ApiResponse<{ sent: boolean }>>(
    "customer/password/reset/send-otp/",
    { email }
  );
  return res.data;
}


export async function verifyResetOtp(email: string, otp: string) {
  const res = await api.post<ApiResponse<{ verified: boolean }>>(
    "customer/password/reset/verify-otp/",
    { email, otp }
  );
  return res.data;
}

export async function changePassword(payload: {
  email: string;
  new_password: string;
  confirm_password: string;
}) {
  const res = await api.post<ApiResponse<{ changed: boolean }>>(
    "customer/password/reset/change/",
    payload
  );
  return res.data;
}


export async function loginCustomer(payload: { email: string; password: string }) {
  const res = await api.post<ApiResponse<any>>("customer/login/", payload);
  const data = res.data;

  if (!data?.success) {
    const msg =
      data?.message ||
      data?.errors?.detail ||
      data?.errors?.non_field_errors?.[0] ||
      "Invalid email or password";
    throw new Error(String(msg));
  }

  return data.data; 
}
