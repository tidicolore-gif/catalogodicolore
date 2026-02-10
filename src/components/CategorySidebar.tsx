import { cn } from "@/lib/utils";
import { categorias, type Categoria } from "@/data/products";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package, Sparkles, Droplets, Palette, Brush, Star, Percent, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategorySidebarProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  "Linha Dicco": <Sparkles className="h-4 w-4" />,
  "Flash Color": <Palette className="h-4 w-4" />,
  "Coloração": <Brush className="h-4 w-4" />,
  "Descolorante": <Star className="h-4 w-4" />,
  "Promoção 20%": <Percent className="h-4 w-4" />,
  "Promoção 30%": <Percent className="h-4 w-4" />,
};

export function CategorySidebar({ selectedCategory, onCategorySelect, isOpen, onClose }: CategorySidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 h-screen lg:h-[calc(100vh-73px)] lg:top-[73px] w-72 bg-card border-r border-border z-50 lg:z-0 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">Categorias</h2>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100%-60px)]">
          <div className="p-3 space-y-1">
            <button
              onClick={() => {
                onCategorySelect(null);
                onClose?.();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                selectedCategory === null
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-secondary text-foreground"
              )}
            >
              <Package className="h-4 w-4" />
              <span className="font-medium">Todos os Produtos</span>
            </button>

            {categorias.map((categoria) => (
              <button
                key={categoria}
                onClick={() => {
                  onCategorySelect(categoria);
                  onClose?.();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                  selectedCategory === categoria
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-secondary text-foreground"
                )}
              >
                {categoryIcons[categoria] || <Droplets className="h-4 w-4" />}
                <span className="font-medium text-sm">{categoria}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
