import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { categorias } from '@/data/products';
import { DBProduct } from '@/hooks/useProducts';
import { Loader2, Upload } from 'lucide-react';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: Omit<DBProduct, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  onUploadImage?: (file: File, productId: string) => Promise<string | null>;
  product?: DBProduct | null;
}

const grupos = [
  "LINHA DICCO",
  "FLASH COLOR",
  "OXIDANTES REVENDA",
  "OXIDANTES LITRO",
  "DESCOLORANTES",
  "TONALIZANTES",
  "COLORAÇÃO",
  "MANUTENÇÃO",
  "FINALIZAÇÃO",
  "LAVATÓRIO LITRO",
  "LINHA MASCULINA",
  "GALÕES",
  "TERAPIA CAPILAR",
  "ALISAMENTO",
  "SCULPT",
  "PROMOÇÃO 20%",
  "PROMOÇÃO 30%",
];

export function ProductForm({ open, onClose, onSave, onUploadImage, product }: ProductFormProps) {
  const [formData, setFormData] = useState({
    procod: product?.procod || '',
    pronom: product?.pronom || '',
    descricao: product?.descricao || '',
    preco: product?.preco?.toString() || '',
    grupo: product?.grupo || '',
    categoria: product?.categoria || '',
    ativo: product?.ativo ?? true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const productData = {
      procod: formData.procod,
      pronom: formData.pronom,
      descricao: formData.descricao || null,
      preco: parseFloat(formData.preco),
      grupo: formData.grupo,
      categoria: formData.categoria,
      foto_url: product?.foto_url || null,
      ativo: formData.ativo,
    };

    const result = await onSave(productData);
    
    if (result && imageFile && onUploadImage) {
      await onUploadImage(imageFile, result.id || product?.id);
    }

    setIsLoading(false);
    onClose();
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="procod">Código (EAN)</Label>
              <Input
                id="procod"
                value={formData.procod}
                onChange={(e) => handleChange('procod', e.target.value)}
                placeholder="7898418096059"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preco">Preço (R$)</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                value={formData.preco}
                onChange={(e) => handleChange('preco', e.target.value)}
                placeholder="29.90"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pronom">Nome do Produto</Label>
            <Input
              id="pronom"
              value={formData.pronom}
              onChange={(e) => handleChange('pronom', e.target.value)}
              placeholder="COCONUT SHAMPOO 250ML"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Descrição detalhada do produto..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Grupo</Label>
              <Select value={formData.grupo} onValueChange={(v) => handleChange('grupo', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o grupo" />
                </SelectTrigger>
                <SelectContent>
                  {grupos.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={formData.categoria} onValueChange={(v) => handleChange('categoria', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Foto do Produto</Label>
            <div className="flex items-center gap-4">
              {product?.foto_url && (
                <img 
                  src={product.foto_url} 
                  alt={product.pronom} 
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <label className="flex-1">
                <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {imageFile ? imageFile.name : 'Clique para fazer upload'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="ativo">Produto Ativo</Label>
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => handleChange('ativo', checked)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="gradient-rose">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
