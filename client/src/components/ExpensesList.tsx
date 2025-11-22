import { useExpenses } from "@/hooks/use-expenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function ExpensesList() {
  const { expenses, isLoading, deleteExpense } = useExpenses();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!expenses || expenses.length === 0) {
    return <div className="text-center text-gray-500">No expenses found.</div>;
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <Card key={expense.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{expense.description}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => expense.id && deleteExpense(expense.id)}
                aria-label="Delete expense"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">{expense.category}</p>
                <p className="text-sm text-gray-500">
                  {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
              <p className="text-lg font-semibold">৳{expense.amount}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}