import { useEffect, useState } from "react";
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
import { type InsertSalesItem, type SalesItem } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SalesItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (item: InsertSalesItem | (Partial<SalesItem> & { id: string })) => void;
  initialData?: SalesItem; // New prop for editing
}

export default function SalesItemModal({ open, onOpenChange, onSubmit, initialData }: SalesItemModalProps) {
  const [formData, setFormData] = useState({
    link: initialData?.link || "",
    name: initialData?.name || "",
    quantity: initialData?.quantity || "1", // Default to 1 for dropdown
    state: initialData?.state || "pending",
  });
  const [customQuantity, setCustomQuantity] = useState(initialData?.quantity || ""); // For custom input
  const [transactionText, setTransactionText] = useState(""); // For parsing transaction text

  useEffect(() => {
    if (initialData) {
      setFormData({
        link: initialData.link || "",
        name: initialData.name || "",
        quantity: initialData.quantity || "1",
        state: initialData.state || "pending",
      });
      setCustomQuantity(initialData.quantity || "");
    } else {
      setFormData({
        link: "",
        name: "",
        quantity: "1",
        state: "pending",
      });
      setCustomQuantity("");
    }
    setTransactionText(""); // Clear transaction text on modal open/close
  }, [initialData, open]);

  const handleParseTransaction = () => {
    const text = transactionText.trim();
    if (!text) return;

    // Regex to extract sale price, last 4 digits, and payment method
    const priceMatch = text.match(/(\d+\.\d{2})\s*TK/);
    const lastDigitsMatch = text.match(/\*{4}(\d{4})/);
    const paymentMethodMatch = text.match(/🟣(B|N)/);

    let extractedPrice = "";
    if (priceMatch && priceMatch[1]) {
      extractedPrice = String(parseInt(priceMatch[1]) / 150); // Convert TK to Coin
    }

    let extractedLastDigits = "";
    if (lastDigitsMatch && lastDigitsMatch[1]) {
      extractedLastDigits = lastDigitsMatch[1];
    }

    let extractedPaymentMethod = "";
    if (paymentMethodMatch && paymentMethodMatch[1]) {
      extractedPaymentMethod = paymentMethodMatch[1] === "B" ? "Bkash" : "Nagad";
    }

    const newName = extractedPaymentMethod && extractedLastDigits
      ? `${extractedPaymentMethod} Sale from ****${extractedLastDigits}`
      : "";

    setFormData((prev) => ({
      ...prev,
      name: newName || prev.name,
      quantity: extractedPrice || prev.quantity,
    }));
    setCustomQuantity(extractedPrice || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuantity = customQuantity !== "" ? customQuantity : formData.quantity;
    
    if (initialData) {
      // Editing existing item
      const updatedItem: Partial<SalesItem> & { id: string } = {
        id: initialData.id,
        link: formData.link,
        name: formData.name,
        quantity: finalQuantity, // Keep as string
        state: formData.state as "pending" | "done",
      };
      onSubmit(updatedItem);
    } else {
      // Creating new item
      const newItem: InsertSalesItem = {
        ...formData,
        quantity: finalQuantity, // Keep as string
      };
      onSubmit(newItem);
    }
    onOpenChange(false);
    setFormData({
      link: "",
      name: "",
      quantity: "1", // Reset to 1
      state: "pending",
    });
    setCustomQuantity(""); // Reset custom quantity
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, quantity: value });
    setCustomQuantity(""); // Clear custom input when dropdown is used
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomQuantity(e.target.value);
    setFormData({ ...formData, quantity: e.target.value }); // Also update formData.quantity
  };

  const dialogTitle = initialData ? "Edit Sales Item" : "Add Sales Item";
  const submitButtonText = initialData ? "Save Changes" : "Save Item";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="modal-sales-item">
        <DialogHeader>
          <DialogTitle data-testid="text-modal-title">{dialogTitle}</DialogTitle>
          <DialogDescription data-testid="text-modal-description">
            {initialData ? "Edit the details for this sales item." : "Enter details for a new sales item."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="transaction-text">Paste Transaction Text</Label>
            <div className="flex gap-2">
              <Textarea
                id="transaction-text"
                placeholder="Paste transaction text here..."
                value={transactionText}
                onChange={(e) => setTransactionText(e.target.value)}
                rows={2}
                className="flex-grow"
              />
              <Button type="button" onClick={handleParseTransaction} className="shrink-0">
                Parse
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              data-testid="input-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Link (Optional)</Label>
            <Input
              id="link"
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              data-testid="input-link"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Coin</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-quantity"
                  type="number"
                  placeholder="Custom"
                  value={customQuantity}
                  onChange={handleCustomInputChange}
                  className="w-2/3" // Larger width
                  data-testid="input-custom-coin"
                />
                <Select
                  value={customQuantity !== "" ? "" : formData.quantity} // If custom is used, select should be empty
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger className="w-1/3" data-testid="select-coin"> {/* Smaller width */}
                    <SelectValue placeholder="Select quantity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => setFormData({ ...formData, state: value })}
              >
                <SelectTrigger className="w-full" data-testid="select-state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-submit">
              {submitButtonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}