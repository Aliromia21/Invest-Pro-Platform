import { useQuery } from '@tanstack/react-query';
import { getCustomerPacks } from '../api/packs';

export function usePacks() {
  return useQuery({
    queryKey: ['packs'],
    queryFn: getCustomerPacks,
  });
}
