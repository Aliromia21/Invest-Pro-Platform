import { useState } from 'react';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoginPageProps {
  onNavigate: (page: 'landing' | 'login' | 'signup' | 'forgot-password') => void;
}

function pickFirst(v: any) {
  return Array.isArray(v) ? v[0] : v;
}

function extractApiError(err: any) {
  const data = err?.response?.data;

  const msg =
    data?.message ||
    pickFirst(data?.errors?.detail) ||
    pickFirst(data?.errors?.non_field_errors) ||
    pickFirst(data?.errors?.email) ||
    pickFirst(data?.errors?.password) ||
    err?.message ||
    'Failed to login';

  return String(msg);
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { t, isRTL } = useLanguage();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const { loginCustomer, loading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const email = formData.email.trim();
    if (!email) newErrors.email = t('auth.validation.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('auth.validation.emailInvalid');

    if (!formData.password) newErrors.password = t('auth.validation.passwordRequired');
    else if (formData.password.length < 6) newErrors.password = t('auth.validation.passwordMin', { n: 6 });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validateForm()) return;

    try {
      const email = formData.email.trim().toLowerCase();
      await loginCustomer(email, formData.password);

      toast.success(t('auth.login.success'));
      navigate('/app', { replace: true });
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = status === 401 ? t('auth.login.invalidCreds') : extractApiError(err);
      setApiError(msg);
      toast.error(msg);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-md">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-blue-200 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('auth.backToHome')}
        </button>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <span className="text-white text-xl">{t('common.brand')}</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-white mb-2">{t('auth.login.title')}</h2>
            <p className="text-blue-200">{t('auth.login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {apiError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-200 rounded-lg p-3 text-sm">
                {apiError}
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-blue-200">
                {t('auth.emailLabel')}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder={t('auth.emailPlaceholder')}
                autoComplete="email"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-blue-200">
                {t('auth.passwordLabel')}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder={t('auth.passwordPlaceholder')}
                autoComplete="current-password"
              />
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-blue-200 text-sm cursor-pointer">
                <input type="checkbox" className="rounded" />
                {t('auth.rememberMe')}
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 py-6">
              {loading ? t('auth.login.loading') : t('auth.login.button')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-blue-200 text-sm">
              {t('auth.login.noAccount')}{' '}
              <button onClick={() => onNavigate('signup')} className="text-blue-400 hover:text-blue-300 transition-colors">
                {t('auth.signup.cta')}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <p className="text-blue-200 text-sm text-center">{t('auth.securityHint')}</p>
        </div>
      </div>
    </div>
  );
}
