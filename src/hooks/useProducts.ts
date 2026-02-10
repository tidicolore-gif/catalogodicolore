import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DBProduct {
  id: string;
  procod: string;
  pronom: string;
  descricao: string | null;
  preco: number;
  grupo: string;
  categoria: string;
  foto_url: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export function useProducts() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('pronom');
    
    if (error) {
      toast({
        title: 'Erro ao carregar produtos',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const createProduct = async (product: Omit<DBProduct, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (error) {
      toast({
        title: 'Erro ao criar produto',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
    
    toast({ title: 'Produto criado com sucesso!' });
    await fetchProducts();
    return data;
  };

  const updateProduct = async (id: string, updates: Partial<DBProduct>) => {
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      toast({
        title: 'Erro ao atualizar produto',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
    
    toast({ title: 'Produto atualizado!' });
    await fetchProducts();
    return true;
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({
        title: 'Erro ao excluir produto',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
    
    toast({ title: 'Produto excluído!' });
    await fetchProducts();
    return true;
  };

  const uploadImage = async (file: File, productId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({
        title: 'Erro ao fazer upload da imagem',
        description: uploadError.message,
        variant: 'destructive',
      });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    await updateProduct(productId, { foto_url: publicUrl });
    return publicUrl;
  };

  const bulkImport = async (productsData: Omit<DBProduct, 'id' | 'created_at' | 'updated_at'>[]) => {
    const { error } = await supabase
      .from('products')
      .upsert(productsData, { onConflict: 'procod' });
    
    if (error) {
      toast({
        title: 'Erro na importação',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
    
    toast({ title: `${productsData.length} produtos importados com sucesso!` });
    await fetchProducts();
    return true;
  };

  return {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    bulkImport,
  };
}
