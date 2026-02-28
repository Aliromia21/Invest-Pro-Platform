import { useState, useEffect } from "react";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

import { registerCustomer } from "@/api/customerAuth";

interface SignupPageProps {
  onSignup: (email: string) => void;
  onNavigate: (page: "landing" | "login" | "signup" | "forgot-password") => void;
}

const REF_KEY = "referral_code";

const countries = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "IE", name: "Ireland" },
  { code: "PT", name: "Portugal" },
  { code: "GR", name: "Greece" },
  { code: "PL", name: "Poland" },
  { code: "SG", name: "Singapore" },
  { code: "HK", name: "Hong Kong" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "AE", name: "UAE" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "QA", name: "Qatar" },
  { code: "IN", name: "India" },
  { code: "MY", name: "Malaysia" },
  { code: "TH", name: "Thailand" },
  { code: "ID", name: "Indonesia" },
  { code: "PH", name: "Philippines" },
  { code: "VN", name: "Vietnam" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "EG", name: "Egypt" },
  { code: "TR", name: "Turkey" },
  { code: "IL", name: "Israel" },
  { code: "NZ", name: "New Zealand" },
];

export function SignupPage({ onSignup, onNavigate }: SignupPageProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    country: "",
    referralCode: "",
  });

  const [refLocked, setRefLocked] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem(REF_KEY) ?? "").trim();
    if (!stored) return;

    setFormData((prev) => ({
      ...prev,
      referralCode: stored.toUpperCase(),
    }));
    setRefLocked(true);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    else if (formData.fullName.trim().length < 2) newErrors.fullName = "Full name must be at least 2 characters";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

    if (!formData.phone) newErrors.phone = "Phone number is required";
    else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) newErrors.phone = "Phone number is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (!formData.country) newErrors.country = "Country is required";
    if (!agreedToTerms) newErrors.terms = "You must agree to the terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function extractApiError(err: any) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.errors?.detail ||
      err?.message ||
      "Request failed";
    const fieldErrors = err?.response?.data?.errors;
    return { msg, fieldErrors };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        country: formData.country, // "DE"
        referral_code: formData.referralCode.trim()
          ? formData.referralCode.trim().toUpperCase()
          : "",
      };

      const res = await registerCustomer(payload);

      if (!res.success) {
        toast.error(res.message || "Registration failed");
        return;
      }

      toast.success("Registered successfully. Please login.");

      // ✅ clear referral after successful signup
      localStorage.removeItem(REF_KEY);

      onSignup(formData.email.trim());
      onNavigate("login");
    } catch (err: any) {
      const { msg, fieldErrors } = extractApiError(err);
      toast.error(msg);

      if (fieldErrors && typeof fieldErrors === "object") {
        const mapped: Record<string, string> = {};
        if (fieldErrors.email) mapped.email = String(fieldErrors.email);
        if (fieldErrors.password) mapped.password = String(fieldErrors.password);
        if (fieldErrors.full_name) mapped.fullName = String(fieldErrors.full_name);
        if (fieldErrors.phone) mapped.phone = String(fieldErrors.phone);
        if (fieldErrors.country) mapped.country = String(fieldErrors.country);
        setErrors((prev) => ({ ...prev, ...mapped }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-2 text-blue-200 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <span className="text-white text-xl">InvestPro</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-white mb-2">Create Your Account</h2>
            <p className="text-blue-200">Start your investment journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fullName" className="text-blue-200">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="Enter your full name"
                />
                {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <Label htmlFor="email" className="text-blue-200">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phone" className="text-blue-200">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="+1 234 567 8900"
                />
                {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="country" className="text-blue-200">Country *</Label>
                <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20 text-white max-h-[300px]">
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code} className="text-white focus:bg-white/10 focus:text-white">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="password" className="text-blue-200">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="Create a password"
                />
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-blue-200">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="referralCode" className="text-blue-200">Referral Code (Optional)</Label>
              <Input
                id="referralCode"
                type="text"
                value={formData.referralCode}
                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="Enter referral code if you have one"
                readOnly={refLocked}
              />
              <p className="text-blue-300 text-xs mt-1">
                {refLocked
                  ? "Referral code was applied automatically from your invite link."
                  : "Have a referral code? Enter it here to get started with a bonus!"}
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-blue-200 text-sm mb-2">Password Requirements:</p>
              <ul className="text-blue-300 text-xs space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Contains uppercase and lowercase letters</li>
                <li>• Contains at least one number</li>
              </ul>
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 rounded"
                />
                <span className="text-blue-200 text-sm">
                  I agree to the{" "}
                  <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Privacy Policy
                  </button>
                </span>
              </label>
              {errors.terms && <p className="text-red-400 text-sm mt-1">{errors.terms}</p>}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 py-6"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-blue-200 text-sm">
              Already have an account?{" "}
              <button onClick={() => onNavigate("login")} className="text-blue-400 hover:text-blue-300 transition-colors">
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
