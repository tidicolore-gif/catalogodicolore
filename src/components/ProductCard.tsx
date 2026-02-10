import { Package, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Product } from "@/data/products";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  product: Product;
  viewMode: "grid" | "list";
}

export function ProductCard({ product, viewMode }: ProductCardProps) {
  const { addItem, removeItem, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  const hasImage = Boolean(product.imagem);

  // =========================
  // GRID VIEW
  // =========================
  if (viewMode === "grid") {
    return (
      <div className="group rounded-2xl border bg-card shadow-sm hover:shadow-md transition overflow-hidden">
        {/* IMAGEM */}
        <div className="relative aspect-[3/4] bg-rose-50 flex items-center justify-center overflow-hidden">
          {hasImage ? (
            <img
              src={product.imagem}
              alt={product.pronom}
              className="w-full h-full object-contain p-4 bg-white"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Package className="h-16 w-16 text-rose-gold transition-transform duration-300 group-hover:scale-110" />
          )}
        </div>

        {/* CONTEÚDO */}
        <div className="p-4 space-y-2">
          <p className="text-xs text-muted-foreground">{product.procod}</p>

          <h3 className="text-sm font-medium leading-tight line-clamp-3">
            {product.pronom}
          </h3>

          <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide">
            {product.grupo}
          </span>

          <div className="flex items-center justify-between pt-2">
            <span className="text-rose-600 font-semibold">
              R$ {product.preco.toFixed(2)}
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => removeItem(product.id)}
                disabled={quantity === 0}
                className="h-8 w-8"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <span className="w-4 text-center text-sm">{quantity}</span>

              <Button
                size="icon"
                onClick={() => addItem(product)}
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // LIST VIEW (MOBILE FRIENDLY)
  // =========================
  return (
    <div className="flex gap-3 p-3 rounded-xl border bg-card">
      {/* IMAGEM */}
      <div className="w-14 h-16 sm:w-16 sm:h-20 rounded-lg bg-rose-50 flex items-center justify-center overflow-hidden flex-shrink-0">
        {hasImage ? (
          <img
            src={product.imagem}
            alt={product.pronom}
            className="w-full h-full object-contain bg-white"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <Package className="h-7 w-7 sm:h-8 sm:w-8 text-rose-gold" />
        )}
      </div>

      {/* INFO */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-xs text-muted-foreground">{product.procod}</p>

        <p className="text-sm font-medium leading-tight">
          {product.pronom}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-rose-600 font-semibold text-sm">
            R$ {product.preco.toFixed(2)}
          </span>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => removeItem(product.id)}
              disabled={quantity === 0}
              className="h-7 w-7"
            >
              <Minus className="h-3 w-3" />
            </Button>

            <span className="w-4 text-center text-sm">{quantity}</span>

            <Button
              size="icon"
              onClick={() => addItem(product)}
              className="h-7 w-7"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    <
