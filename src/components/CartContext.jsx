import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { UserContext } from './UserContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const { user } = useContext(UserContext);

  const API_URL = 'http://localhost/StoryForge/api';

  // Загружаем продукты при старте
  useEffect(() => {
    fetchProducts();
  }, []);

  // Загружаем корзину только если пользователь авторизован
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      // Если пользователь не авторизован, берем корзину из localStorage
      const localCart = localStorage.getItem('localCart');
      if (localCart) {
        setCartItems(JSON.parse(localCart));
      } else {
        setCartItems([]);
      }
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products.php`);
      setProducts(response.data);
    } catch (error) {
      console.error('Ошибка загрузки продуктов:', error);
    }
  };

  const fetchCart = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_URL}/cart.php?user_id=${user.id}`);
      setCartItems(response.data);
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      // Для неавторизованных - сохраняем в localStorage
      const newCart = [...cartItems];
      const existingItem = newCart.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        newCart.push({ ...product, quantity: 1 });
      }
      
      setCartItems(newCart);
      localStorage.setItem('localCart', JSON.stringify(newCart));
      return;
    }

    // Для авторизованных - сохраняем в БД
    try {
      await axios.post(`${API_URL}/cart.php`, {
        user_id: user.id,
        product_id: product.id,
        quantity: 1
      });
      await fetchCart();
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
    }
  };

  const removeFromCart = async (id) => {
    if (!user) {
      const newCart = cartItems.filter(item => item.id !== id);
      setCartItems(newCart);
      localStorage.setItem('localCart', JSON.stringify(newCart));
      return;
    }

    try {
      await axios.delete(`${API_URL}/cart.php?id=${id}`);
      await fetchCart();
    } catch (error) {
      console.error('Ошибка удаления из корзины:', error);
    }
  };

  const updateCartItemQuantity = async (id, quantity) => {
    if (!user) {
      const newCart = cartItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      );
      setCartItems(newCart);
      localStorage.setItem('localCart', JSON.stringify(newCart));
      return;
    }

    try {
      await axios.put(`${API_URL}/cart.php?id=${id}`, { quantity });
      await fetchCart();
    } catch (error) {
      console.error('Ошибка обновления количества:', error);
    }
  };

  const clearCart = async () => {
    if (!user) {
      setCartItems([]);
      localStorage.removeItem('localCart');
      return;
    }

    try {
      await axios.delete(`${API_URL}/cart.php?user_id=${user.id}`);
      setCartItems([]);
    } catch (error) {
      console.error('Ошибка очистки корзины:', error);
    }
  };

  const addProduct = async (product) => {
    try {
      const response = await axios.post(`${API_URL}/products.php`, product);
      await fetchProducts();
      return response.data;
    } catch (error) {
      console.error('Ошибка добавления продукта:', error);
    }
  };

  const updateProduct = async (product) => {
    try {
      const response = await axios.put(`${API_URL}/products.php?id=${product.id}`, product);
      await fetchProducts();
      return response.data;
    } catch (error) {
      console.error('Ошибка обновления продукта:', error);
    }
  };

  const removeProduct = async (id) => {
    try {
      await axios.delete(`${API_URL}/products.php?id=${id}`);
      await fetchProducts();
    } catch (error) {
      console.error('Ошибка удаления продукта:', error);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      products,
      addToCart,
      removeFromCart,
      clearCart,
      addProduct,
      removeProduct,
      updateProduct,
      updateCartItemQuantity
    }}>
      {children}
    </CartContext.Provider>
  );
};