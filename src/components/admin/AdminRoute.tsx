import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

type Props = {
  children: React.ReactNode;
};

export function AdminRoute({ children }: Props) {
  const { user } = useAuth();

  const isAdmin = Boolean(user?.is_staff || user?.is_superuser);

  if (!user) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/customer" replace />;

  return <>{children}</>;
}
