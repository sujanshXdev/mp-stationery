import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';
import type { Product, CartItem } from '../data/mockData';
import { API_BASE_URL } from '../utils/apiConfig';
import axios from 'axios';

// Context Types
interface ShopContextType {
  products: Product[];
  isLoading: boolean;
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (item: Product, quantity?: number, unitTypeOverride?: 'Packet' | 'Piece', options?: { suppressToast?: boolean }) => void;
  removeFromCart: (id: string, options?: { suppressToast?: boolean }) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  updateCartUnitType: (cartItemId: string, unitType: 'Packet' | 'Piece') => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  addToWishlist: (item: Product) => void;
  removeFromWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  reorderCart: (startIndex: number, endIndex: number) => void;
  getProductById: (id: string) => Product | undefined;
  placeOrder: () => Promise<any>;
}

// Create Context
const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Provider Component
interface ShopProviderProps {
  children: ReactNode;
}

export const ShopProvider: React.FC<ShopProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Fetch Cart from backend
  const fetchCart = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/cart`, { withCredentials: true });
      if (data.success) {
        const normalizedCart = data.products.map((item: any) => {
          const product = item.product || {};
          
          let price = 0;
          if (product.category === 'Book') {
            price = product.priceToSell ?? product.marketPrice ?? product.price ?? 0;
          } else {
            if (item.unitType === 'Packet') {
              price = product.pricePerPacket ?? product.price ?? 0;
            } else { // 'Piece' or undefined defaults to piece price
              price = product.pricePerPiece ?? product.price ?? 0;
            }
          }

          return {
            ...product,
            id: product._id,
            cartItemId: item._id,
            image: product.images?.[0] || '',
            quantity: item.quantity,
            unitType: item.unitType,
            price: price,
          };
        });
        setCart(normalizedCart);
      }
    } catch (error) {
      // console.error("Failed to fetch cart:", error);
      setCart([]);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/products?limit=1000`, { credentials: 'include' });
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          const normalized: Product[] = data.products.map((p: any) => {
            let price = 0;
            if (p.category === 'Book') {
              price = p.priceToSell ?? p.marketPrice ?? 0;
            } else if (p.unitType === 'Packet') {
              price = p.pricePerPacket ?? 0;
            } else {
              price = p.pricePerPiece ?? 0;
            }
            return {
              ...p,
              price,
              id: String(p._id || p.id),
              images: Array.isArray(p.images) ? p.images : [],
            };
          });
          setProducts(normalized);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Wishlist Handlers
  const isWishlisted = useCallback((id: string) => {
    return wishlist.some(item => item.id === id);
  }, [wishlist]);

  const addToWishlist = useCallback((item: Product) => {
    if (isWishlisted(item.id)) {
      setWishlist(prev => prev.filter(w => w.id !== item.id));
      toast.error(`${item.name} removed from wishlist!`);
    } else {
      setWishlist(prev => [...prev, item]);
      toast.success(`${item.name} added to wishlist!`);
    }
  }, [isWishlisted]);

  const removeFromWishlist = useCallback((id: string) => {
    const item = wishlist.find(w => w.id === id);
    if (item) {
      setWishlist(prev => prev.filter(w => w.id !== id));
      toast.error(`${item.name} removed from wishlist!`);
    }
  }, [wishlist]);

  // Cart Handlers
  const addToCart = useCallback(async (item: Product, quantity = 1, unitTypeOverride?: 'Packet' | 'Piece', options?: { suppressToast?: boolean }) => {
    try {
      const payload = { 
        productId: item.id, 
        quantity,
        unitType: item.category === 'Book' ? undefined : unitTypeOverride || 'Piece'
      };
      await axios.post(`${API_BASE_URL}/cart`, payload, { withCredentials: true });
      if (!options?.suppressToast) {
        toast.success(`${item.name} added to cart!`);
      }
      fetchCart(); // Refetch cart to get the latest state
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (id: string, options?: { suppressToast?: boolean }) => {
    try {
       // Note: The 'id' here is the cartItemId
      await axios.delete(`${API_BASE_URL}/cart/${id}`, { withCredentials: true });
      if (!options?.suppressToast) {
        toast.success(`Item removed from cart!`);
      }
      fetchCart(); // Refetch cart
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove item');
    }
  }, [fetchCart]);

  const updateCartQuantity = useCallback(async (id: string, quantity: number) => {
    if (quantity <= 0) {
      // 'id' here is cartItemId
      removeFromCart(id);
      return;
    }
    try {
      // 'id' here is cartItemId
      await axios.put(`${API_BASE_URL}/cart/${id}`, { quantity }, { withCredentials: true });
      fetchCart(); // Refetch cart
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    }
  }, [fetchCart, removeFromCart]);

  const updateCartUnitType = useCallback(async (cartItemId: string, unitType: 'Packet' | 'Piece') => {
    try {
      await axios.put(`${API_BASE_URL}/cart/${cartItemId}`, { unitType }, { withCredentials: true });
      fetchCart();
      toast.success(`Updated to ${unitType}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update unit type');
    }
  }, [fetchCart]);

  const reorderCart = useCallback((startIndex: number, endIndex: number) => {
    setCart(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await axios.delete(`${API_BASE_URL}/cart`, { withCredentials: true });
      setCart([]);
      toast.success('Cart cleared!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to clear cart');
    }
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  }, [cart]);

  const getCartCount = useCallback(() => {
    return cart.length;
  }, [cart]);

  const getProductById = useCallback(
    (id: string) => {
      return products.find((p) => p.id === id);
    },
    [products]
  );

  const placeOrder = useCallback(async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return null;
    }
    try {
      const { data } = await axios.post(`${API_BASE_URL}/orders/new`, {}, { withCredentials: true });
      if (data.success) {
        toast.success(`Order #${data.order.orderID} placed successfully!`);
        await fetchCart(); // Refreshes and clears the cart state
        return data.order;
      }
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
      return null;
    }
  }, [fetchCart, cart]);

  // Context Value
  const value = {
    products,
    isLoading,
    cart,
    wishlist,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    updateCartUnitType,
    clearCart,
    getCartTotal,
    getCartCount,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
    reorderCart,
    getProductById,
    placeOrder,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

// Custom Hook
export const useShop = (): ShopContextType => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}; 