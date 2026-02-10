import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { CategorySidebar } from "@/components/CategorySidebar";
import { ProductGrid } from "@/components/ProductGrid";
import { CartSheet } from "@/components/CartSheet";
import { CheckoutModal } from "@/components/CheckoutModal";
import { products } from "@/data/products";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categoria === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.pronom.toLowerCase().includes(term) ||
          p.procod.toLowerCase().includes(term) ||
          p.grupo.toLowerCase().includes(term) ||
          p.categoria.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [searchTerm, selectedCategory]);

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      <div className="flex">
        <CategorySidebar
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 container py-6 lg:pl-6">
          {/* Category Header */}
          {selectedCategory && (
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">
                {selectedCategory}
              </h2>
              <p className="text-muted-foreground mt-1">
                Explore os melhores produtos dessa categoria
              </p>
            </div>
          )}

          <ProductGrid
            products={filteredProducts}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </main>
      </div>

      <CartSheet
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        onCheckout={handleCheckout}
      />

      <CheckoutModal
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
      />
    </div>
  );
};

export default Index;
