import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { useAuth } from './contexts/AuthContext';

export default function AdminApp() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
    } finally {
      navigate('/admin/login', { replace: true });
    }
  };

  return <AdminDashboard onLogout={handleLogout} />;
}
