import { useState } from 'react';
import DataEntryModal from '../DataEntryModal';
import { Button } from '@/components/ui/button';
import { type InsertBusinessMetric } from '@shared/schema'; // Import the type

export default function DataEntryModalExample() {
  const [open, setOpen] = useState(false);

  const handleSubmit = (metric: InsertBusinessMetric) => {
    console.log("Dummy onSubmit for DataEntryModalExample:", metric);
    // In a real scenario, you would handle the metric submission here
  };

  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)} data-testid="button-open-modal">
        Open Data Entry Form
      </Button>
      <DataEntryModal open={open} onOpenChange={setOpen} onSubmit={handleSubmit} />
    </div>
  );
}
