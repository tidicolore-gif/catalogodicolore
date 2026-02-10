import { useState } from 'react';
import { DiscountPolicy, useDiscountPolicies } from '@/hooks/useDiscountPolicies';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Loader2, Percent } from 'lucide-react';

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

export function DiscountPoliciesManager() {
  const { policies, loading, createPolicy, updatePolicy, deletePolicy } = useDiscountPolicies();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<DiscountPolicy | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    grupo: '',
    quantidade_minima: '',
    quantidade_maxima: '',
    percentual_desconto: '',
  });

  const handleOpenForm = (policy?: DiscountPolicy) => {
    if (policy) {
      setEditingPolicy(policy);
      setFormData({
        grupo: policy.grupo,
        quantidade_minima: policy.quantidade_minima.toString(),
        quantidade_maxima: policy.quantidade_maxima?.toString() || '',
        percentual_desconto: policy.percentual_desconto.toString(),
      });
    } else {
      setEditingPolicy(null);
      setFormData({
        grupo: '',
        quantidade_minima: '',
        quantidade_maxima: '',
        percentual_desconto: '',
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPolicy(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const policyData = {
      grupo: formData.grupo,
      quantidade_minima: parseInt(formData.quantidade_minima),
      quantidade_maxima: formData.quantidade_maxima ? parseInt(formData.quantidade_maxima) : null,
      percentual_desconto: parseFloat(formData.percentual_desconto),
    };

    if (editingPolicy) {
      await updatePolicy(editingPolicy.id, policyData);
    } else {
      await createPolicy(policyData);
    }

    setIsSaving(false);
    handleCloseForm();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deletePolicy(deleteId);
      setDeleteId(null);
    }
  };

  // Group policies by grupo
  const policiesByGrupo = policies.reduce((acc, policy) => {
    if (!acc[policy.grupo]) {
      acc[policy.grupo] = [];
    }
    acc[policy.grupo].push(policy);
    return acc;
  }, {} as Record<string, DiscountPolicy[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Políticas de Desconto</h2>
          <p className="text-sm text-muted-foreground">
            Configure descontos progressivos por grupo e quantidade
          </p>
        </div>
        <Button onClick={() => handleOpenForm()} className="gradient-rose">
          <Plus className="h-4 w-4 mr-2" />
          Nova Política
        </Button>
      </div>

      {Object.keys(policiesByGrupo).length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-secondary/20">
          <Percent className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma política cadastrada</h3>
          <p className="text-muted-foreground mb-4">
            Crie políticas de desconto para aplicar descontos progressivos
          </p>
          <Button onClick={() => handleOpenForm()} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Criar primeira política
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(policiesByGrupo).map(([grupo, groupPolicies]) => (
            <div key={grupo} className="border rounded-lg overflow-hidden">
              <div className="bg-secondary/50 px-4 py-3 border-b">
                <Badge variant="secondary" className="font-semibold">
                  {grupo}
                </Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quantidade Mínima</TableHead>
                    <TableHead>Quantidade Máxima</TableHead>
                    <TableHead className="text-right">Desconto</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>{policy.quantidade_minima} peças</TableCell>
                      <TableCell>
                        {policy.quantidade_maxima 
                          ? `${policy.quantidade_maxima} peças` 
                          : 'Sem limite'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-accent text-accent-foreground">
                          {policy.percentual_desconto}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenForm(policy)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(policy.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPolicy ? 'Editar Política' : 'Nova Política de Desconto'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Grupo</Label>
              <Select 
                value={formData.grupo} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, grupo: v }))}
              >
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade_minima">Quantidade Mínima</Label>
                <Input
                  id="quantidade_minima"
                  type="number"
                  min="1"
                  value={formData.quantidade_minima}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantidade_minima: e.target.value }))}
                  placeholder="6"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade_maxima">Quantidade Máxima</Label>
                <Input
                  id="quantidade_maxima"
                  type="number"
                  min="1"
                  value={formData.quantidade_maxima}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantidade_maxima: e.target.value }))}
                  placeholder="12 (opcional)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentual_desconto">Percentual de Desconto (%)</Label>
              <Input
                id="percentual_desconto"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.percentual_desconto}
                onChange={(e) => setFormData(prev => ({ ...prev, percentual_desconto: e.target.value }))}
                placeholder="5"
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="gradient-rose">
                {isSaving ? (
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Política</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta política de desconto?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
