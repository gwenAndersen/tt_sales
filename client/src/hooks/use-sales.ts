import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type SaleWithTransactions } from '@shared/schema';

// --- Fetching Sales ---
export const useSales = () => {
  return useQuery<SaleWithTransactions[]>({
    queryKey: ['sales'],
    queryFn: async () => {
      const res = await fetch('/api/sales');
      if (!res.ok) throw new Error('Failed to fetch sales');
      return res.json();
    },
  });
};

// --- Updating a Sale ---
interface UpdateSalePayload {
  saleId: string;
  updates: {
    link?: string;
    price?: number;
  };
}

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ saleId, updates }: UpdateSalePayload) => {
      const res = await fetch(`/api/sales/${saleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update sale');
      return res.json();
    },
    onSuccess: () => {
      // When a sale is updated, refetch both sales and transactions
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

// --- Deleting a Sale ---
export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (saleId: string) => {
      const res = await fetch(`/api/sales/${saleId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete sale');
    },
    onSuccess: () => {
      // When a sale is deleted, refetch both sales and transactions
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
