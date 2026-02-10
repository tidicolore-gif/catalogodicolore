-- Enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabela de produtos
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    procod TEXT NOT NULL UNIQUE,
    pronom TEXT NOT NULL,
    descricao TEXT,
    preco NUMERIC(10,2) NOT NULL DEFAULT 0,
    grupo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    foto_url TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de política de descontos (grupo x quantidade x percentual)
CREATE TABLE public.discount_policies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    grupo TEXT NOT NULL,
    quantidade_minima INTEGER NOT NULL,
    quantidade_maxima INTEGER,
    percentual_desconto NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(grupo, quantidade_minima)
);

-- Tabela de roles de usuário (separada por segurança)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar se usuário é admin (SECURITY DEFINER para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Produtos: leitura pública, escrita apenas admin
CREATE POLICY "Produtos são visíveis para todos" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Admins podem inserir produtos" 
ON public.products 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar produtos" 
ON public.products 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar produtos" 
ON public.products 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Políticas de desconto: leitura pública, escrita apenas admin
CREATE POLICY "Políticas de desconto são visíveis para todos" 
ON public.discount_policies 
FOR SELECT 
USING (true);

CREATE POLICY "Admins podem inserir políticas" 
ON public.discount_policies 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar políticas" 
ON public.discount_policies 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar políticas" 
ON public.discount_policies 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- User roles: usuário só pode ver sua própria role
CREATE POLICY "Usuários podem ver suas próprias roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discount_policies_updated_at
BEFORE UPDATE ON public.discount_policies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar bucket para fotos de produtos
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Políticas de storage para fotos
CREATE POLICY "Fotos de produtos são públicas" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Admins podem fazer upload de fotos" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar fotos" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar fotos" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));