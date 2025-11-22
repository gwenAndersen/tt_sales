import { type Transaction } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export const TransactionRow = ({ tx }: { tx: Transaction }) => {
  const isCredit = parseFloat(tx.amount) > 0;
  const categoryColor = tx.category === 'Sale' ? 'bg-green-100 text-green-800' : tx.category === 'coin sell' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{tx.description}</div>
        <div className="text-sm text-muted-foreground">{format(new Date(tx.date), "PPP")}</div>
      </TableCell>
      <TableCell>
        <Badge className={categoryColor}>{tx.category}</Badge>
      </TableCell>
      <TableCell className={`text-right font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
        {isCredit ? '+' : ''}{parseFloat(tx.amount).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', numberingSystem: 'latn' })}
      </TableCell>
    </TableRow>
  );
};
