import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Expense, type InsertExpense } from "@shared/schema";

export function useExpenses() {
  const queryClient = useQueryClient();

  const { data: expenses, isLoading } = useQuery<Expense[]>({ 
    queryKey: ["expenses"], 
    queryFn: async () => {
      console.log("Fetching expenses...");
      const res = await fetch("/api/expenses", { credentials: 'include' });
      if (!res.ok) {
        console.error("Failed to fetch expenses:", res.status, res.statusText);
        throw new Error("Failed to fetch expenses");
      }
      const data = await res.json();
      console.log("Expenses data:", data);
      return data;
    }
  });

  const { mutate: createExpense } = useMutation<Expense, Error, InsertExpense>({
    mutationFn: async (newItem) => {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error("Failed to create expense");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  const { mutate: deleteExpense } = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error("Failed to delete expense");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  return { expenses, isLoading, createExpense, deleteExpense };
}