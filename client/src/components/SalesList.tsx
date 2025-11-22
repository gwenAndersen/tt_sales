import React, { useState } from 'react';
import { useSales, useDeleteSale } from "@/hooks/use-sales";
import { useUpdateSaleState } from "@/hooks/use-transactions";
import { type SaleWithTransactions } from "@/server/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import EditSaleModal from "@/components/EditSaleModal";

const SaleCard = ({ sale, onEdit, onDelete }: { sale: SaleWithTransactions, onEdit: (sale: SaleWithTransactions) => void, onDelete: (saleId: string) => void }) => {
  const updateSaleStateMutation = useUpdateSaleState();
  
  const saleTransaction = sale.transactions.find(t => t.category === 'Sale');
  const costTransaction = sale.transactions.find(t => t.category === 'coin sell');

  const handleStateChange = (newState: string) => {
    updateSaleStateMutation.mutate({ saleId: sale.id, state: newState });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className='space-y-1'>
          <CardTitle className="text-sm font-medium">{saleTransaction?.description || 'N/A'}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {format(new Date(sale.createdAt), "PPP p")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(sale)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(sale.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-green-600">
            +{parseFloat(saleTransaction?.amount || '0').toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={sale.state === "pending" ? "destructive" : "default"}>
              {sale.state}
            </Badge>
            <Select value={sale.state} onValueChange={handleStateChange}>
              <SelectTrigger className="w-[110px] h-8">
                <SelectValue placeholder="Change State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-md font-bold text-red-600">
          {parseFloat(costTransaction?.amount || '0').toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </div>
        {sale.link && (
          <p className="text-xs text-muted-foreground">
            Link: <a href={sale.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{sale.link}</a>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default function SalesList() {
  const { data: sales, isLoading } = useSales();
  const deleteSaleMutation = useDeleteSale();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<SaleWithTransactions | null>(null);

  const handleEdit = (sale: SaleWithTransactions) => {
    setEditingSale(sale);
    setIsModalOpen(true);
  };

  const handleDelete = (saleId: string) => {
    if (window.confirm("Are you sure you want to delete this sale? This will also delete the associated financial transactions.")) {
      deleteSaleMutation.mutate(saleId);
    }
  };

  if (isLoading) {
    return <div>Loading sales...</div>;
  }

  return (
    <div className="space-y-4">
      {sales && sales.length > 0 ? (
        sales.map((sale) => (
          <SaleCard key={sale.id} sale={sale} onEdit={handleEdit} onDelete={handleDelete} />
        ))
      ) : (
        <p>No sales recorded yet.</p>
      )}
      <EditSaleModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        sale={editingSale}
      />
    </div>
  );
}
