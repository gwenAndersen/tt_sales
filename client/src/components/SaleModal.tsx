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
import { Textarea } from "@/components/ui/textarea";
import { useCreateSaleEvent } from "@/hooks/use-transactions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SaleModal({ open, onOpenChange }: SaleModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [link, setLink] = useState("");
  const [state, setState] = useState("pending");
  const [transactionText, setTransactionText] = useState("");
  
  const createSaleEventMutation = useCreateSaleEvent();

  useEffect(() => {
    if (!open) {
      setName("");
      setPrice("");
      setLink("");
      setState("pending");
      setTransactionText("");
    }
  }, [open]);

  const handleParseTransaction = () => {
    const text = transactionText.trim();
    if (!text) return;

    const priceMatch = text.match(/(\d+\.\d{2})\s*TK/);
    const lastDigitsMatch = text.match(/\*{4}(\d{4})/);
    const paymentMethodMatch = text.match(/🟣(B|N)/);

    if (priceMatch && priceMatch[1]) {
      setPrice(priceMatch[1]);
    }

    let extractedPaymentMethod = "";
    if (paymentMethodMatch && paymentMethodMatch[1]) {
      extractedPaymentMethod = paymentMethodMatch[1] === "B" ? "Bkash" : "Nagad";
    }

    if (lastDigitsMatch && lastDigitsMatch[1] && extractedPaymentMethod) {
      setName(`${extractedPaymentMethod} Sale from ****${lastDigitsMatch[1]}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceAsNumber = parseFloat(price);
    if (!name || isNaN(priceAsNumber) || priceAsNumber <= 0) {
      alert("Please enter a valid name and positive price.");
      return;
    }

    createSaleEventMutation.mutate({
      name,
      price: priceAsNumber,
      link,
      state,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record a Sale</DialogTitle>
          <DialogDescription>
            Manually enter sale details or paste transaction text to parse it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="transaction-text">Paste Transaction Text (Optional)</Label>
            <div className="flex gap-2">
              <Textarea
                id="transaction-text"
                placeholder="Paste transaction text here..."
                value={transactionText}
                onChange={(e) => setTransactionText(e.target.value)}
                rows={3}
                className="flex-grow"
              />
              <Button type="button" onClick={handleParseTransaction} className="shrink-0 self-end">
                Parse
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Sale Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 100 Coins"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Total Price (Revenue)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 300"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <Button type="submit" disabled={createSaleEventMutation.isPending}>
              {createSaleEventMutation.isPending ? "Recording..." : "Record Sale"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
