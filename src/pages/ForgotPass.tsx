import { ForgotPassword } from '../components/ForgotPassword';

export default function ForgotPass() {
  const handleNavigate = (page: string) => {
    console.log('Navigate to:', page);
  };

  return <ForgotPassword onNavigate={handleNavigate as any} />;
}
