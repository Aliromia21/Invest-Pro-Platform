import { IdentityVerification } from '../components/IdentityVerification';

export default function IdentityVerify() {
  const handleVerified = () => {
    console.log('Identity verified');
  };

  return (
    <IdentityVerification
      email="demo@example.com"
      onVerified={handleVerified}
    />
  );
}
