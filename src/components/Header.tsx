import { ShoppingCart, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCartClick: () => void;
  onMenuClick: () => void;
}

export function Header({ searchTerm, onSearchChange, onCartClick, onMenuClick }: HeaderProps) {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full gradient-rose flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">D</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-xl font-bold text-foreground">DICOLORE</h1>
              <p className="text-xs text-muted-foreground -mt-1">Cosméticos</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-10 sm:h-9 bg-secondary/50 border-transparent focus:border-primary/30 focus:bg-card transition-colors text-base sm:text-sm"
              />
            </div>
          </div>

          {/* Cart button */}
          <Button
            onClick={onCartClick}
            className="relative gradient-rose text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Carrinho</span>
            {totalItems > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-accent text-accent-foreground font-semibold text-xs"
              >
                {totalItems}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
