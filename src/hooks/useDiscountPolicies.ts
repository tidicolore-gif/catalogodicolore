import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DiscountPolicy {
  id: string;
  grupo: string;
  quantidade_minima: number;
  quantidade_maxima: number | null;
  percentual_desconto: number;
  created_at: string;
  updated_at: string;
}

export function useDiscountPolicies() {
  const [policies, setPolicies] = useState<DiscountPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPolicies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('discount_policies')
      .select('*')
      .order('grupo')
      .order('quantidade_minima');
    
    if (error) {
      toast({
        title: 'Erro ao carregar políticas de desconto',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setPolicies(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const createPolicy = async (policy: Omit<DiscountPolicy, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('discount_policies')
      .insert(policy)
      .select()
      .single();
    
    if (error) {
      toast({
        title: 'Erro ao criar política',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
    
    toast({ title: 'Política de desconto criada!' });
    await fetchPolicies();
    return data;
  };

  const updatePolicy = async (id: string, updates: Partial<DiscountPolicy>) => {
    const { error } = await supabase
      .from('discount_policies')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      toast({
        title: 'Erro ao atualizar política',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
    
    toast({ title: 'Política atualizada!' });
    await fetchPolicies();
    return true;
  };

  const deletePolicy = async (id: string) => {
    const { error } = await supabase
      .from('discount_policies')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({
        title: 'Erro ao excluir política',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
    
    toast({ title: 'Política excluída!' });
    await fetchPolicies();
    return true;
  };

  return {
    policies,
    loading,
    fetchPolicies,
    createPolicy,
    updatePolicy,
    deletePolicy,
  };
}
