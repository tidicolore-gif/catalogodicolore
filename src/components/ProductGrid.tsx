import { List, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/data/products";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function ProductGrid({ products, viewMode, onViewModeChange }: ProductGridProps) {
  return (
    <div className="flex-1">
      {/* View Toggle & Product Count */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">{products.length}</span> produtos encontrados
        </p>
        
        <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "px-3",
              viewMode === "grid" && "bg-card shadow-sm"
            )}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Cards
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "px-3",
              viewMode === "list" && "bg-card shadow-sm"
            )}
          >
            <List className="h-4 w-4 mr-2" />
            Lista
          </Button>
        </div>
      </div>

      {/* Products */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <LayoutGrid className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Tente ajustar sua pesquisa ou selecione outra categoria.
          </p>
        </div>
      ) : (
        <div className={cn(
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "flex flex-col gap-3"
        )}>
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
