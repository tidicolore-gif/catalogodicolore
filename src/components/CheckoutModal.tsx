import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCart, CustomerData } from "@/contexts/CartContext";
import { getDescontoLabel } from "@/data/products";
import { User, MapPin, Phone, CreditCard, Clock, Share2, FileText, ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { items, getSubtotal, getTotalWithDiscounts, getGroupDiscounts, setCustomerData, clearCart } = useCart();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"form" | "summary">("form");
  const [formData, setFormData] = useState<CustomerData>({
    nomeCompleto: "",
    cpfCnpj: "",
    endereco: "",
    telefoneWhatsApp: "",
    condicaoPagamento: "",
    melhorHoraEntrega: "",
  });

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

  // Helper: discount percentage for a product's group
  const getItemDiscount = (grupo: string): number => {
    const groupData = groupDiscounts.get(grupo);
    return groupData?.discount || 0;
  };

  const handleInputChange = (field: keyof CustomerData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      formData.nomeCompleto.trim() !== "" &&
      formData.cpfCnpj.trim() !== "" &&
      formData.endereco.trim() !== "" &&
      formData.telefoneWhatsApp.trim() !== "" &&
      formData.condicaoPagamento !== "" &&
      formData.melhorHoraEntrega !== ""
    );
  };

  const handleContinue = () => {
    if (isFormValid()) {
      setCustomerData(formData);
      setStep("summary");
    }
  };

  const generateOrderText = () => {
    let text = "═══════════════════════════\n";
    text += "    PEDIDO DICOLORE COSMÉTICOS\n";
    text += "═══════════════════════════\n\n";
    
    text += "📋 DADOS DO CLIENTE\n";
    text += "───────────────────────────\n";
    text += `Nome: ${formData.nomeCompleto}\n`;
    text += `CPF/CNPJ: ${formData.cpfCnpj}\n`;
    text += `Endereço: ${formData.endereco}\n`;
    text += `WhatsApp: ${formData.telefoneWhatsApp}\n`;
    text += `Pagamento: ${formData.condicaoPagamento}\n`;
    text += `Entrega: ${formData.melhorHoraEntrega}\n\n`;
    
    text += "🛒 ITENS DO PEDIDO\n";
    text += "───────────────────────────\n";
    
    items.forEach((item) => {
      const discount = getItemDiscount(item.product.grupo);
      const discountUnit = item.product.preco * discount;
      const discountTotal = discountUnit * item.quantity;

      text += `\n${item.product.pronom}\n`;
      text += `  Cód: ${item.product.procod}\n`;
      text += `  Qtd: ${item.quantity} x ${formatPrice(item.product.preco)}\n`;
      if (discount > 0) {
        text += `  Desconto aplicado: ${Math.round(discount * 100)}% (-${formatPrice(discountTotal)})\n`;
      }
      text += `  Subtotal: ${formatPrice(item.product.preco * item.quantity - discountTotal)}\n`;
    });
    
    text += "\n───────────────────────────\n";
    text += `Subtotal: ${formatPrice(subtotal)}\n`;
    
    if (totalDiscount > 0) {
      text += "\n💰 DESCONTOS POR GRUPO:\n";
      Array.from(groupDiscounts).forEach(([grupo, data]) => {
        if (data.discount > 0) {
          text += `  ${grupo}: ${getDescontoLabel(data.quantity)} (-${formatPrice(data.discountValue)})\n`;
        }
      });
      text += `\nTotal Descontos: -${formatPrice(totalDiscount)}\n`;
    }
    
    text += "───────────────────────────\n";
    text += `✨ TOTAL FINAL: ${formatPrice(total)}\n`;
    text += "═══════════════════════════\n";
    
    return text;
  };

  const handleShare = async () => {
    const orderText = generateOrderText();
    
    // Tentar usar Web Share API nativa (funciona em mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pedido Dicolore Cosméticos",
          text: orderText,
        });
        toast({
          title: "Pedido compartilhado!",
          description: "O resumo foi enviado com sucesso.",
        });
      } catch (err) {
        // Usuário cancelou ou erro - não fazer nada
        if ((err as Error).name !== "AbortError") {
          // Fallback para WhatsApp se der erro
          const encodedText = encodeURIComponent(orderText);
          window.open(`https://wa.me/?text=${encodedText}`, "_blank");
        }
      }
    } else {
      // Fallback para WhatsApp direto (desktop)
      const encodedText = encodeURIComponent(orderText);
      window.open(`https://wa.me/?text=${encodedText}`, "_blank");
      toast({
        title: "Pedido enviado!",
        description: "O resumo foi aberto no WhatsApp para compartilhar.",
      });
    }
  };

  const handleDownloadTxt = () => {
    const orderText = generateOrderText();
    const blob = new Blob([orderText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedido-dicolore-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download iniciado!",
      description: "O arquivo do pedido foi baixado.",
    });
  };

  const handleFinish = () => {
    clearCart();
    setStep("form");
    setFormData({
      nomeCompleto: "",
      cpfCnpj: "",
      endereco: "",
      telefoneWhatsApp: "",
      condicaoPagamento: "",
      melhorHoraEntrega: "",
    });
    onOpenChange(false);
    
    toast({
      title: "Pedido finalizado!",
      description: "Obrigado pela preferência.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl h-[90vh] sm:h-auto sm:max-h-[85vh] flex flex-col p-4 sm:p-6">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-display text-lg sm:text-xl">
            {step === "form" ? "Dados do Pedido" : "Resumo do Pedido"}
          </DialogTitle>
        </DialogHeader>

        {step === "form" ? (
          <ScrollArea className="flex-1 -mx-4 sm:-mx-6 px-4 sm:px-6 min-h-0">
            <div className="space-y-5 py-4">
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Nome Completo *
                </Label>
                <Input
                  placeholder="Digite seu nome completo"
                  value={formData.nomeCompleto}
                  onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
                />
              </div>

              {/* CPF/CNPJ */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  CPF / CNPJ *
                </Label>
                <Input
                  placeholder="000.000.000-00"
                  value={formData.cpfCnpj}
                  onChange={(e) => handleInputChange("cpfCnpj", e.target.value)}
                />
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Endereço Completo *
                </Label>
                <Input
                  placeholder="Rua, número, bairro, cidade"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange("endereco", e.target.value)}
                />
              </div>

              {/* Telefone WhatsApp */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Telefone WhatsApp *
                </Label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={formData.telefoneWhatsApp}
                  onChange={(e) => handleInputChange("telefoneWhatsApp", e.target.value)}
                />
              </div>

              {/* Condição de Pagamento */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Condição de Pagamento *
                </Label>
                <Select
                  value={formData.condicaoPagamento}
                  onValueChange={(value) => handleInputChange("condicaoPagamento", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cartao">Cartão de Crédito/Débito</SelectItem>
                    <SelectItem value="boleto">Boleto Bancário</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Melhor Hora para Entrega */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Melhor Hora para Entrega *
                </Label>
                <Select
                  value={formData.melhorHoraEntrega}
                  onValueChange={(value) => handleInputChange("melhorHoraEntrega", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manha">Manhã (08h - 12h)</SelectItem>
                    <SelectItem value="tarde">Meio da Tarde (12h - 16h)</SelectItem>
                    <SelectItem value="fim-dia">Final do Dia (16h - 19h)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="flex-1 -mx-4 sm:-mx-6 px-4 sm:px-6 min-h-0">
            <div className="space-y-5 py-4">
              {/* Customer Info Summary */}
              <div className="p-4 rounded-lg bg-secondary/50">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Dados do Cliente
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Nome:</span>
                  <span>{formData.nomeCompleto}</span>
                  <span className="text-muted-foreground">CPF/CNPJ:</span>
                  <span>{formData.cpfCnpj}</span>
                  <span className="text-muted-foreground">Endereço:</span>
                  <span>{formData.endereco}</span>
                  <span className="text-muted-foreground">WhatsApp:</span>
                  <span>{formData.telefoneWhatsApp}</span>
                  <span className="text-muted-foreground">Pagamento:</span>
                  <span className="capitalize">{formData.condicaoPagamento}</span>
                  <span className="text-muted-foreground">Entrega:</span>
                  <span className="capitalize">{formData.melhorHoraEntrega.replace("-", " ")}</span>
                </div>
              </div>

              {/* Items Summary */}
              <div>
                <h3 className="font-semibold mb-3">Itens do Pedido</h3>
                <div className="space-y-2">
                  {items.map((item) => {
                    const discount = getItemDiscount(item.product.grupo);
                    const discountUnit = item.product.preco * discount;
                    const discountTotal = discountUnit * item.quantity;

                    return (
                      <div key={item.product.id} className="flex justify-between text-sm p-2 rounded bg-secondary/30">
                        <div className="flex-1">
                          <p className="font-medium truncate">{item.product.pronom}</p>
                          <p className="text-muted-foreground text-xs">
                            {item.quantity} x {formatPrice(item.product.preco)}
                            {discount > 0 && (
                              <span className="ml-2 text-accent font-medium">{Math.round(discount * 100)}% de desconto</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold block">{formatPrice(item.product.preco * item.quantity - discountTotal)}</span>
                          {discount > 0 && (
                            <span className="text-[11px] text-accent block">-{formatPrice(discountTotal)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Discounts */}
              {totalDiscount > 0 && (
                <div className="p-4 rounded-lg bg-gold-light/50 border border-gold/20">
                  <h3 className="font-semibold mb-3 text-gold">Descontos Aplicados</h3>
                  <div className="space-y-1">
                    {Array.from(groupDiscounts).map(([grupo, data]) => (
                      data.discount > 0 && (
                        <div key={grupo} className="flex justify-between text-sm">
                          <span>{grupo} ({data.quantity} itens)</span>
                          <span className="text-accent">-{formatPrice(data.discountValue)}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-accent">
                    <span>Descontos</span>
                    <span>-{formatPrice(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-display text-xl font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        {/* Actions */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
          {step === "form" ? (
            <Button
              className="flex-1 gradient-rose text-primary-foreground hover:opacity-90 h-12"
              onClick={handleContinue}
              disabled={!isFormValid()}
            >
              Continuar
            </Button>
          ) : (
            <> 
              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("form")}
                  className="h-11 sm:h-12 flex-1 sm:flex-initial"
                >
                  <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Voltar</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadTxt}
                  className="h-11 sm:h-12 flex-1 sm:flex-initial"
                >
                  <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Baixar</span> TXT
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleFinish}
                  className="h-11 sm:h-12 flex-1 sm:flex-initial"
                >
                  <Check className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Concluir</span>
                </Button>
              </div>
              <Button
                className="flex-1 gradient-rose text-primary-foreground hover:opacity-90 h-12"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar Pedido
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}