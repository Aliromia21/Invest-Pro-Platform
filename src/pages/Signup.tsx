import { SignupPage } from '../components/SignupPage';

export default function Signup() {
  const handleSignup = (email: string) => {
    console.log('Signup:', email);
  };

  const handleNavigate = (page: string) => {
    console.log('Navigate to:', page);
  };

  return <SignupPage onSignup={handleSignup} onNavigate={handleNavigate as any} />;
}
