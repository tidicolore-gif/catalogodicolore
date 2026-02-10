import React, { createContext, useContext, useState, useCallback } from "react";
import { Product, calcularDescontoGrupo } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerData {
  nomeCompleto: string;
  cpfCnpj: string;
  endereco: string;
  telefoneWhatsApp: string;
  condicaoPagamento: string;
  melhorHoraEntrega: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotalWithDiscounts: () => number;
  getGroupDiscounts: () => Map<string, { quantity: number; discount: number; subtotal: number; discountValue: number }>;
  customerData: CustomerData | null;
  setCustomerData: (data: CustomerData) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter((item) => item.product.id !== productId);
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCustomerData(null);
  }, []);

  const getItemQuantity = useCallback(
    (productId: string) => {
      return items.find((item) => item.product.id === productId)?.quantity || 0;
    },
    [items]
  );

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getSubtotal = useCallback(() => {
    return items.reduce(
      (total, item) => total + item.product.preco * item.quantity,
      0
    );
  }, [items]);

  const getGroupDiscounts = useCallback(() => {
    const groupMap = new Map<
      string,
      { quantity: number; discount: number; subtotal: number; discountValue: number }
    >();

    items.forEach((item) => {
      const grupo = item.product.grupo;
      const current = groupMap.get(grupo) || {
        quantity: 0,
        discount: 0,
        subtotal: 0,
        discountValue: 0,
      };
      current.quantity += item.quantity;
      current.subtotal += item.product.preco * item.quantity;
      groupMap.set(grupo, current);
    });

    groupMap.forEach((value, key) => {
      const discount = calcularDescontoGrupo(value.quantity);
      value.discount = discount;
      value.discountValue = value.subtotal * discount;
      groupMap.set(key, value);
    });

    return groupMap;
  }, [items]);

  const getTotalWithDiscounts = useCallback(() => {
    const groupDiscounts = getGroupDiscounts();
    let total = 0;
    groupDiscounts.forEach((value) => {
      total += value.subtotal - value.discountValue;
    });
    return total;
  }, [getGroupDiscounts]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
        getTotalItems,
        getSubtotal,
        getTotalWithDiscounts,
        getGroupDiscounts,
        customerData,
        setCustomerData,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
