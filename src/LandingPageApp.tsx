import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { EmailVerification } from './components/EmailVerification';
import { IdentityVerification } from './components/IdentityVerification';
import { ForgotPassword } from './components/ForgotPassword';

type Page =
  | 'landing'
  | 'login'
  | 'signup'
  | 'email-verification'
  | 'identity-verification'
  | 'forgot-password';

export default function LandingPageApp() {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageFromUrl = useMemo<Page>(() => {
    const raw = (searchParams.get('page') || '').trim().toLowerCase();
    const allowed: Page[] = [
      'landing',
      'login',
      'signup',
      'email-verification',
      'identity-verification',
      'forgot-password',
    ];
    return (allowed as string[]).includes(raw) ? (raw as Page) : 'landing';
  }, [searchParams]);

  const [currentPage, setCurrentPage] = useState<Page>(pageFromUrl);
  const [userEmail, setUserEmail] = useState('demo@example.com');

  // Keep internal state aligned with URL (e.g. redirect to /?page=login)
  useEffect(() => {
    setCurrentPage(pageFromUrl);
  }, [pageFromUrl]);

  const navigatePage = (page: Page) => {
    setCurrentPage(page);

    // Only persist the entry pages in the URL
    if (page === 'landing') {
      setSearchParams({}, { replace: true });
      return;
    }

    if (page === 'login' || page === 'signup' || page === 'forgot-password') {
      setSearchParams({ page }, { replace: true });
      return;
    }
  };

  const handleSignup = (email: string) => {
    setUserEmail(email);
    setCurrentPage('email-verification');
  };

  const handleEmailVerified = () => {
    setCurrentPage('identity-verification');
  };

  const handleIdentityVerified = () => {
    // لاحقاً: هنا يمكن توجيه المستخدم إلى Dashboard بعد إكمال KYC
    // مثلاً: navigate('/app')
    alert('Verification complete! In the full app, you would be redirected to the Customer Dashboard.');
  };

  const handleResendCode = () => {
    console.log('Resending verification code to:', userEmail);
  };

  // ✅ صفحة اللاندينغ الأساسية
  if (currentPage === 'landing') {
    return <LandingPage onNavigate={navigatePage} />;
  }

  // ✅ صفحة تسجيل الدخول – الآن تستدعي useAuth داخل LoginPage
  if (currentPage === 'login') {
    return <LoginPage onNavigate={navigatePage} />;
  }

  if (currentPage === 'signup') {
    return <SignupPage onSignup={handleSignup} onNavigate={navigatePage} />;
  }

  if (currentPage === 'email-verification') {
    return (
      <EmailVerification
        email={userEmail}
        onVerified={handleEmailVerified}
        onResend={handleResendCode}
      />
    );
  }

  if (currentPage === 'identity-verification') {
    return (
      <IdentityVerification
        email={userEmail}
        onVerified={handleIdentityVerified}
      />
    );
  }

  if (currentPage === 'forgot-password') {
    return <ForgotPassword onNavigate={navigatePage} />;
  }

  return null;
}
