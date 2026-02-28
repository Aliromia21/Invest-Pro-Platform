import { LandingPage } from '../components/LandingPage';

export default function Landing() {
  const handleNavigate = (page: string) => {
    console.log('Navigate to:', page);
  };

  return <LandingPage onNavigate={handleNavigate as any} />;
}
