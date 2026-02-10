import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useProducts, DBProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { DiscountPoliciesManager } from '@/components/admin/DiscountPoliciesManager';
import { ImportProducts } from '@/components/admin/ImportProducts';
import { 
  Package, 
  Percent, 
  FileSpreadsheet, 
  LogOut, 
  Loader2, 
  Plus,
  Home
} from 'lucide-react';

export default function Admin() {
  const { user, isAdmin, loading, signOut } = useAdmin();
  const { products, loading: productsLoading, createProduct, updateProduct, deleteProduct, uploadImage, bulkImport } = useProducts();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DBProduct | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      navigate('/');
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleOpenForm = (product?: DBProduct) => {
    setEditingProduct(product || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (productData: Omit<DBProduct, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
      return editingProduct;
    } else {
      return await createProduct(productData);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-rose flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-lg">D</span>
              </div>
              <div>
                <h1 className="font-display text-xl font-bold">DICOLORE Admin</h1>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Loja
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="discounts" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              <span className="hidden sm:inline">Descontos</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Importar</span>
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Gerenciar Produtos</h2>
                <p className="text-sm text-muted-foreground">
                  {products.length} produtos cadastrados
                </p>
              </div>
              <Button onClick={() => handleOpenForm()} className="gradient-rose">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </div>

            {productsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ProductsTable
                products={products}
                onEdit={handleOpenForm}
                onDelete={deleteProduct}
              />
            )}
          </TabsContent>

          {/* Discounts Tab */}
          <TabsContent value="discounts">
            <DiscountPoliciesManager />
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import">
            <ImportProducts onImport={bulkImport} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Product Form Modal */}
      <ProductForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveProduct}
        onUploadImage={uploadImage}
        product={editingProduct}
      />
    </div>
  );
}
