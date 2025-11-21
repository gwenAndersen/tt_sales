import React, { useState, useEffect } from 'react';
import { useSalesItems } from "@/hooks/use-sales-items";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Copy } from "lucide-react";
import SalesItemModal from "@/components/SalesItemModal";
import { type SalesItem, type InsertSalesItem } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface SalesListProps {
  isSelectionMode: boolean;
  onSelectionChange: (selectedItems: SalesItem[]) => void;
}

export default function SalesList({ isSelectionMode, onSelectionChange }: SalesListProps) {
  const { salesItems, isLoading, updateSalesItem, deleteSalesItem } = useSalesItems();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SalesItem | undefined>(undefined);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const currentlySelectedItems = salesItems?.filter(item => selectedItemIds.includes(item.id)) || [];
    onSelectionChange(currentlySelectedItems);
  }, [selectedItemIds, salesItems, onSelectionChange]);

  const handleEdit = (item: SalesItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this sales item?")) {
      deleteSalesItem(id);
    }
  };

  const handleCopyIndividual = (item: SalesItem) => {
    const copiedText = `Item: ${item.name}, Coin: ${parseInt(item.quantity) * 100}, State: ${item.state}, Link: ${item.link || 'N/A'}`;
    navigator.clipboard.writeText(copiedText);
    toast({ title: "Copied to clipboard", description: "Item details copied." });
  };

  const handleModalSubmit = (item: InsertSalesItem | (Partial<SalesItem> & { id: string })) => {
    if ("id" in item) {
      // It's an update
      updateSalesItem(item);
    } else {
      // It's a create (should not happen from here, as modal is opened from Sales page)
      // createSalesItem(item as Omit<SalesItem, "id" | "createdAt">);
    }
    setEditingItem(undefined);
  };

  const handleCheckboxChange = (checked: boolean, itemId: string) => {
    setSelectedItemIds(prev => 
      checked ? [...prev, itemId] : prev.filter(id => id !== itemId)
    );
  };

  if (isLoading) {
    return <div>Loading sales items...</div>;
  }

  if (!salesItems || salesItems.length === 0) {
    return <div>No sales items found.</div>;
  }

  return (
    <div className="space-y-4">
      {salesItems.map((item) => (
        <Card key={item.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              {isSelectionMode && (
                <Checkbox
                  checked={selectedItemIds.includes(item.id)}
                  onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, item.id)}
                  aria-label="Select item"
                />
              )}
              <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2"> 
              <Badge variant={item.state === "pending" ? "destructive" : "default"}>
                {item.state}
              </Badge>
              <Select
                value={item.state}
                onValueChange={(value) => updateSalesItem({ id: item.id, state: value as "pending" | "done" })}
              >
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue placeholder="Change State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => handleCopyIndividual(item)}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Coin: {item.quantity && !isNaN(parseInt(item.quantity)) ? parseInt(item.quantity) * 100 : item.quantity}</div>
            <p className="text-xs text-muted-foreground">
              Link: {item.link ? <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{item.link}</a> : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">
              Added: {format(new Date(item.createdAt), "PPP p")}
            </p>
          </CardContent>
        </Card>
      ))}
      <SalesItemModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingItem(undefined); // Clear editing item when modal closes
        }}
        onSubmit={handleModalSubmit}
        initialData={editingItem}
      />
    </div>
  );
}