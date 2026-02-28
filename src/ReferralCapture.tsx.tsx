import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const REF_KEY = "referral_code";

export default function ReferralCapture() {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();

  useEffect(() => {
    const ref = (code ?? "").trim();
    if (ref) localStorage.setItem(REF_KEY, ref.toUpperCase());

    navigate("/?page=signup", { replace: true });
  }, [code, navigate]);

  return null;
}
