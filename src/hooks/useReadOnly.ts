import { useAuth } from '../contexts/AuthContext';

export function useReadOnly(): boolean {
  const { role } = useAuth();
  return role === 'viewer';
}
