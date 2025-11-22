import React from 'react';
import { useTransactions, useUpdateSaleState } from "@/hooks/use-transactions";
import { type TransactionWithSaleDetails } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const TransactionRow = ({ tx }: { tx: TransactionWithSaleDetails }) => {
  const updateSaleStateMutation = useUpdateSaleState();
  const isCredit = parseFloat(tx.amount) > 0;
  
  let categoryColor = "bg-gray-100 text-gray-800";
  if (tx.category === 'Sale') {
    categoryColor = "bg-green-100 text-green-800";
  } else if (tx.category === 'coin sell') {
    categoryColor = "bg-red-100 text-red-800";
  }

  const handleStateChange = (newState: string) => {
    if (tx.saleId) {
      updateSaleStateMutation.mutate({ saleId: tx.saleId, state: newState });
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{tx.description}</div>
        <div className="text-sm text-muted-foreground">
          {format(new Date(tx.date), "PPP")}
        </div>
        {tx.sale?.link && (
           <a href={tx.sale.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
             View Link
           </a>
        )}
      </TableCell>
      <TableCell>
        <Badge className={categoryColor}>{tx.category}</Badge>
      </TableCell>
      <TableCell>
        {tx.sale && (
          <div className="flex items-center gap-2">
            <Badge variant={tx.sale.state === "pending" ? "destructive" : "default"}>
              {tx.sale.state}
            </Badge>
            <Select value={tx.sale.state} onValueChange={handleStateChange}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue placeholder="Change State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </TableCell>
      <TableCell className={`text-right font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
        {isCredit ? '+' : ''}{parseFloat(tx.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
      </TableCell>
    </TableRow>
  );
};

export default function TransactionList() {
  const { data: transactions, isLoading } = useTransactions();

  if (isLoading) {
    return <div>Loading transactions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Details</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Sale State</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions && transactions.length > 0 ? (
              transactions.map(tx => <TransactionRow key={tx.id} tx={tx} />)
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No transactions yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
