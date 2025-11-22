import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type Transaction, type InsertTransaction, type TransactionWithSaleDetails } from '@shared/schema';

// --- Fetching Transactions ---
export const useTransactions = () => {
  return useQuery<TransactionWithSaleDetails[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await fetch('/api/transactions');
      if (!res.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return res.json();
    },
  });
};

// --- Creating a Manual Transaction ---
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTransaction: InsertTransaction) => {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction),
      });
      if (!res.ok) {
        throw new Error('Failed to create transaction');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

// --- Creating a Sale Event ---
interface SaleEvent {
  name: string;
  price: number;
  link?: string;
  state?: string;
}

export const useCreateSaleEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (saleEvent: SaleEvent) => {
      const res = await fetch('/api/sale-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleEvent),
      });
      if (!res.ok) {
        throw new Error('Failed to create sale event');
      }
      return res.json();
    },
    onSuccess: () => {
      // A sale event creates transactions, so we invalidate both queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
};

// --- Updating a Sale's State ---
export const useUpdateSaleState = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ saleId, state }: { saleId: string; state: string }) => {
      const res = await fetch(`/api/sales/${saleId}/state`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      });
      if (!res.ok) {
        throw new Error('Failed to update sale state');
      }
      return res.json();
    },
    onSuccess: () => {
      // When a sale state changes, refetch both sales and transactions to keep all views in sync
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
