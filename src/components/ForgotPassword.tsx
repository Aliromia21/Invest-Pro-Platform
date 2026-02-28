import { useState } from "react";
import { TrendingUp, ArrowLeft, Mail, Lock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";

import { sendResetOtp, verifyResetOtp, changePassword } from "@/api/customerAuth";
import { useLanguage } from "@/contexts/LanguageContext";

interface ForgotPasswordProps {
  onNavigate: (page: "landing" | "login" | "signup" | "forgot-password") => void;
}

type Step = "email" | "verify" | "reset" | "success";

function extractApiError(err: any) {
  const data = err?.response?.data;
  const msg = data?.message || data?.errors?.otp || data?.errors?.detail || err?.message || "Request failed";
  return String(msg);
}

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const { t, isRTL } = useLanguage();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = () => {
    if (!email) return t("auth.validation.emailRequired");
    if (!/\S+@\S+\.\S+/.test(email)) return t("auth.validation.emailInvalid");
    return "";
  };

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const emailErr = validateEmail();
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const res = await sendResetOtp(email.trim());
      if (!res.success) {
        toast.error(res.message || t("auth.forgot.errors.sendFail"));
        return;
      }
      toast.success(t("auth.forgot.toast.otpSent"));
      setStep("verify");
    } catch (err: any) {
      toast.error(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError(t("emailVerify.errors.incompleteCode"));
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const res = await verifyResetOtp(email.trim(), code);
      if (!res.success) {
        toast.error(res.message || t("auth.forgot.errors.verifyFail"));
        return;
      }
      toast.success(t("auth.forgot.toast.otpVerified"));
      setStep("reset");
    } catch (err: any) {
      const msg = extractApiError(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      setError(t("auth.validation.passwordRequired"));
      return;
    }
    if (newPassword.length < 8) {
      setError(t("auth.validation.passwordMin", { n: 8 }));
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setError(t("auth.forgot.validation.passwordComplexity"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("auth.forgot.validation.passwordsNoMatch"));
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const res = await changePassword({
        email: email.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (!res.success) {
        toast.error(res.message || t("auth.forgot.errors.resetFail"));
        return;
      }

      toast.success(t("auth.forgot.toast.resetSuccess"));
      setStep("success");
    } catch (err: any) {
      const msg = extractApiError(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => onNavigate("login");

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-md">
        <button
          onClick={() => (step === "email" ? onNavigate("login") : setStep("email"))}
          className="flex items-center gap-2 text-blue-200 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === "email" ? t("auth.backToLogin") : t("common.back")}
        </button>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <span className="text-white text-xl">{t("common.brand")}</span>
          </div>

          {step === "email" && (
            <>
              <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-blue-400" />
              </div>

              <div className="text-center mb-8">
                <h2 className="text-white mb-2">{t("auth.forgot.title")}</h2>
                <p className="text-blue-200">{t("auth.forgot.subtitle")}</p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-blue-200">
                    {t("auth.emailLabel")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="bg-white/10 border-white/20 text-white mt-2"
                    placeholder={t("auth.emailPlaceholder")}
                  />
                  {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 py-6">
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("common.sending")}
                    </span>
                  ) : (
                    t("auth.forgot.sendCode")
                  )}
                </Button>
              </form>
            </>
          )}

          {step === "verify" && (
            <>
              <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-purple-400" />
              </div>

              <div className="text-center mb-8">
                <h2 className="text-white mb-2">{t("auth.forgot.verifyTitle")}</h2>
                <p className="text-blue-200 mb-2">{t("emailVerify.sentTo")}</p>
                <p className="text-white">{email}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-blue-200 text-sm mb-3 block text-center">{t("emailVerify.enterCode")}</label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={code}
                      onChange={(value) => {
                        setCode(value);
                        setError("");
                      }}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="bg-white/10 border-white/20 text-white" />
                        <InputOTPSlot index={1} className="bg-white/10 border-white/20 text-white" />
                        <InputOTPSlot index={2} className="bg-white/10 border-white/20 text-white" />
                        <InputOTPSlot index={3} className="bg-white/10 border-white/20 text-white" />
                        <InputOTPSlot index={4} className="bg-white/10 border-white/20 text-white" />
                        <InputOTPSlot index={5} className="bg-white/10 border-white/20 text-white" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                </div>

                <Button
                  onClick={handleVerifyCode}
                  disabled={code.length !== 6 || isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 py-6"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("emailVerify.verifying")}
                    </span>
                  ) : (
                    t("auth.forgot.verifyButton")
                  )}
                </Button>

                <div className="text-center">
                  <button
                    onClick={() => handleSendCode()}
                    disabled={isLoading}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors disabled:opacity-50"
                  >
                    {t("emailVerify.resend")}
                  </button>
                </div>
              </div>
            </>
          )}

          {step === "reset" && (
            <>
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-green-400" />
              </div>

              <div className="text-center mb-8">
                <h2 className="text-white mb-2">{t("auth.forgot.resetTitle")}</h2>
                <p className="text-blue-200">{t("auth.forgot.resetSubtitle")}</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <Label htmlFor="newPassword" className="text-blue-200">
                    {t("auth.forgot.newPassword")}
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError("");
                    }}
                    className="bg-white/10 border-white/20 text-white mt-2"
                    placeholder={t("auth.forgot.newPasswordPlaceholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-blue-200">
                    {t("auth.forgot.confirmPassword")}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    className="bg-white/10 border-white/20 text-white mt-2"
                    placeholder={t("auth.forgot.confirmPasswordPlaceholder")}
                  />
                  {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-blue-200 text-sm mb-2">{t("auth.forgot.passwordRequirements")}</p>
                  <ul className="text-blue-300 text-xs space-y-1">
                    <li>{t("auth.forgot.req.min8")}</li>
                    <li>{t("auth.forgot.req.upperLower")}</li>
                    <li>{t("auth.forgot.req.number")}</li>
                  </ul>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 py-6">
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("auth.forgot.resetting")}
                    </span>
                  ) : (
                    t("auth.forgot.resetButton")
                  )}
                </Button>
              </form>
            </>
          )}

          {step === "success" && (
            <>
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>

              <div className="text-center mb-8">
                <h2 className="text-white mb-2">{t("auth.forgot.successTitle")}</h2>
                <p className="text-blue-200">{t("auth.forgot.successSubtitle")}</p>
              </div>

              <Button onClick={handleBackToLogin} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 py-6">
                {t("auth.backToLogin")}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
