import { EmailVerification } from '../components/EmailVerification';

export default function EmailVerify() {
  const handleVerified = () => {
    console.log('Email verified');
  };

  const handleResend = () => {
    console.log('Resend code');
  };

  return (
    <EmailVerification
      email="demo@example.com"
      onVerified={handleVerified}
      onResend={handleResend}
    />
  );
}
