import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Percent } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { getDescontoLabel } from "@/data/products";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
}

export function CartSheet({ open, onOpenChange, onCheckout }: CartSheetProps) {
  const { 
    items, 
    addItem, 
    removeItem, 
    clearCart, 
    getSubtotal, 
    getTotalWithDiscounts,
    getGroupDiscounts 
  } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const subtotal = getSubtotal();
  const total = getTotalWithDiscounts();
  const totalDiscount = subtotal - total;
  const groupDiscounts = getGroupDiscounts();

  // Get discount percentage for a product's group
  const getItemDiscount = (grupo: string): number => {
    const groupData = groupDiscounts.get(grupo);
    return groupData?.discount || 0;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-display">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Carrinho de Compras
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Carrinho vazio
            </h3>
            <p className="text-muted-foreground text-sm">
              Adicione produtos para começar seu pedido
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">
                {items.reduce((acc, item) => acc + item.quantity, 0)} itens
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearCart}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>

            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4">
                  {items.map((item) => {
                    const discount = getItemDiscount(item.product.grupo);
                    const discountAmount = item.product.preco * discount;
                    
                    return (
                      <div 
                        key={item.product.id} 
                        className="p-3 rounded-lg bg-secondary/50 space-y-2"
                      >
                        {/* Linha 1: Nome do produto */}
                        <p className="font-medium text-sm text-foreground">
                          {item.product.pronom}
                        </p>
                        
                        {/* Linha 2: Info + Controles */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                            {discount > 0 && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-accent/20 text-accent border-accent/30">
                                {Math.round(discount * 100)}%
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {item.product.grupo}
                            </Badge>

                            {/* Preço em destaque + valor do desconto abaixo do preço */}
                            <div className="flex flex-col min-w-0 ml-1">
                              <span className="text-sm font-semibold text-primary truncate">
                                {formatPrice(item.product.preco)}
                              </span>
                              {discount > 0 && (
                                <span className="text-[11px] font-medium text-accent whitespace-nowrap">
                                  -{formatPrice(discountAmount)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full touch-manipulation"
                              onClick={() => removeItem(item.product.id)}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="w-5 text-center font-semibold text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              className="h-8 w-8 rounded-full gradient-rose text-primary-foreground touch-manipulation"
                              onClick={() => addItem(item.product)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Group Discounts Info */}
              {Array.from(groupDiscounts).some(([_, v]) => v.discount > 0) && (
                <div className="mt-6 p-4 rounded-lg bg-gold-light/50 border border-gold/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Percent className="h-4 w-4 text-gold" />
                    <span className="font-semibold text-sm">Descontos por Grupo</span>
                  </div>
                  <div className="space-y-2">
                    {Array.from(groupDiscounts).map(([grupo, data]) => (
                      <div key={grupo} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {data.discount > 0 ? (
                            <Badge className="text-[11px] px-1.5 py-0 bg-accent/20 text-accent border-accent/30">
                              {Math.round(data.discount * 100)}%
                            </Badge>
                          ) : (
                            <Percent className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-muted-foreground">
                            {grupo} ({data.quantity} itens)
                          </span>
                        </div>
                        <span className={data.discount > 0 ? "text-accent font-semibold" : "text-muted-foreground"}>
                          {getDescontoLabel(data.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>

            <div className="border-t border-border pt-4 mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-accent">
                  <span>Descontos</span>
                  <span>-{formatPrice(totalDiscount)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-display text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>

              <Button 
                className="w-full gradient-rose text-primary-foreground hover:opacity-90 h-12"
                onClick={onCheckout}
              >
                Finalizar Pedido
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}