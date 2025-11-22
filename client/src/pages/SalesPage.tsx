import SalesList from "@/components/SalesList";

export default function SalesPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-xl font-semibold">Sales Management</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <SalesList />
      </main>
    </div>
  );
}
