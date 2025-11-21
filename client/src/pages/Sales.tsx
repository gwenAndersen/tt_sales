import React, { useState, useRef, useEffect } from 'react';
import SalesList from "@/components/SalesList";
import { Button } from "@/components/ui/button";
import { PlusCircle, Copy } from "lucide-react"; // Added Copy icon
import SalesItemModal from "@/components/SalesItemModal";
import { useSalesItems } from "@/hooks/use-sales-items";
import { type InsertSalesItem, type SalesItem } from "@shared/schema"; // Added SalesItem type
import { useToast } from "@/hooks/use-toast";

// Define the global function type
declare global {
  interface Window {
    updateBackendStatus: (isRunning: boolean) => void;
  }
}

export default function Sales() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false); // New state for selection mode
  const [selectedItems, setSelectedItems] = useState<SalesItem[]>([]); // State to hold selected items
  const { createSalesItem, salesItems } = useSalesItems();
  const mainRef = useRef<HTMLElement>(null);
  const { toast } = useToast();
  const [isBackendRunning, setIsBackendRunning] = useState(false);

  useEffect(() => {
    window.updateBackendStatus = (isRunning: boolean) => {
      setIsBackendRunning(isRunning);
    };

    return () => {
      delete window.updateBackendStatus;
    };
  }, []);

  const handleCreateSalesItem = (item: InsertSalesItem | (Partial<SalesItem> & { id: string })) => {
    if ("id" in item) {
      // This case should not happen when modal is opened from "Add Sales Item" button
      console.warn("Attempted to update item from 'Add Sales Item' modal.");
    } else {
      createSalesItem(item);
    }
  };

  // Scroll to bottom when salesItems change or on initial load
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = mainRef.current.scrollHeight;
    }
  }, [salesItems]);

  const handleCopySelected = () => {
    if (selectedItems.length === 0) {
      toast({ title: "No items selected", description: "Please select items to copy.", variant: "destructive" });
      return;
    }
    const copiedText = selectedItems.map(item => 
      `Item: ${item.name}, Coin: ${parseInt(item.quantity) * 100}, State: ${item.state}, Link: ${item.link || 'N/A'}`
    ).join("\n");
    navigator.clipboard.writeText(copiedText);
    toast({ title: "Copied to clipboard", description: `${selectedItems.length} items copied.` });
    setSelectedItems([]); // Clear selection after copying
    setIsSelectionMode(false); // Exit selection mode
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Sales Items</h1>
            <span className={`text-xs px-2 py-1 rounded-full ${isBackendRunning ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              Backend: {isBackendRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
          <div className="flex gap-2">
            {isSelectionMode && (
              <Button variant="outline" onClick={handleCopySelected} disabled={selectedItems.length === 0}>
                <Copy className="h-4 w-4 mr-2" /> Copy Selected ({selectedItems.length})
              </Button>
            )}
            <Button variant="outline" onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedItems([]); // Clear selection when toggling mode
            }}>
              {isSelectionMode ? "Cancel Selection" : "Select"}
            </Button>
          </div>
        </div>
      </header>
      <main ref={mainRef} className="flex-1 max-w-7xl mx-auto px-6 py-8 overflow-y-auto">
        <SalesList isSelectionMode={isSelectionMode} onSelectionChange={setSelectedItems} />
        <Button
          className="w-full mt-4 rounded-md px-4 py-2 shadow-lg flex items-center justify-center gap-2"
          onClick={() => setIsModalOpen(true)}
          aria-label="Add Sales Item"
        >
          <PlusCircle className="h-5 w-5" /> Add Sales Item
        </Button>
      </main>

      <SalesItemModal open={isModalOpen} onOpenChange={setIsModalOpen} onSubmit={handleCreateSalesItem} />
    </div>
  );
}
