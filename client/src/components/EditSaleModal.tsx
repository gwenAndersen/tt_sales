import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateSale } from "@/hooks/use-sales";
import { type SaleWithTransactions } from "@/server/storage";

interface EditSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: SaleWithTransactions | null;
}

export default function EditSaleModal({ open, onOpenChange, sale }: EditSaleModalProps) {
  const [price, setPrice] = useState("");
  const [link, setLink] = useState("");
  
  const updateSaleMutation = useUpdateSale();

  useEffect(() => {
    if (sale) {
      const saleTransaction = sale.transactions.find(t => t.category === 'Sale');
      setPrice(saleTransaction ? String(parseFloat(saleTransaction.amount)) : "");
      setLink(sale.link || "");
    }
  }, [sale]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sale) return;

    const priceAsNumber = parseFloat(price);
    if (isNaN(priceAsNumber) || priceAsNumber <= 0) {
      alert("Please enter a valid positive price.");
      return;
    }

    updateSaleMutation.mutate({
      saleId: sale.id,
      updates: {
        price: priceAsNumber,
        link: link,
      },
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Sale</DialogTitle>
          <DialogDescription>
            Update the details for this sale.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Link (Optional)</Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateSaleMutation.isPending}>
              {updateSaleMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
