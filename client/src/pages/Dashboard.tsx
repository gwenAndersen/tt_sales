import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, TrendingUp, TrendingDown, ClipboardList, ArrowRightLeft } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";
import SaleModal from "@/components/SaleModal";
import TransactionModal from "@/components/TransactionModal";
import { StatCard } from "@/components/StatCard";
import { TransactionRow } from "@/components/TransactionRow";

export default function Dashboard() {
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const { data: transactions, isLoading } = useTransactions();

  const totalFund = transactions?.reduce((sum, tx) => sum + parseFloat(tx.amount), 0) || 0;
  const totalRevenue = transactions?.filter(tx => tx.category === 'Sale').reduce((sum, tx) => sum + parseFloat(tx.amount), 0) || 0;
  const totalExpenses = transactions?.filter(tx => parseFloat(tx.amount) < 0).reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0) || 0;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Total Fund:</span>
            <div className="text-2xl font-bold">
              {totalFund.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', numberingSystem: 'latn' })}
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div onClick={() => setIsSaleModalOpen(true)} className="cursor-pointer hover:bg-muted/50 rounded-xl transition-colors">
              <StatCard 
                title="Record a Sale"
                value=""
                description="Log a new sale event."
                icon={<PlusCircle className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
            <Link href="/sales">
              <div className="cursor-pointer hover:bg-muted/50 rounded-xl transition-colors">
                <StatCard 
                  title="Manage Sales"
                  value=""
                  description="Edit state, price, and links."
                  icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />}
                />
              </div>
            </Link>
            <div onClick={() => setIsTransactionModalOpen(true)} className="cursor-pointer hover:bg-muted/50 rounded-xl transition-colors">
              <StatCard 
                title="Add Transaction"
                value=""
                description="Log manual income or expenses."
                icon={<ArrowRightLeft className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard 
              title="Total Revenue"
              value={`+${totalRevenue.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', numberingSystem: 'latn' })}`}
              description="All incoming sale transactions"
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard 
              title="Total Expenses"
              value={`-${totalExpenses.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', numberingSystem: 'latn' })}`}
              description="All outgoing transactions"
              icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Link href="/transactions">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Details</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions && transactions.length > 0 ? (
                    transactions.slice(0, 5).map(tx => <TransactionRow key={tx.id} tx={tx} />)
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">
                        No transactions yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      <SaleModal open={isSaleModalOpen} onOpenChange={setIsSaleModalOpen} />
      <TransactionModal open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen} />
    </div>
  );
}