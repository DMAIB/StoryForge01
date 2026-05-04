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
      syncLocalCartWithServer();
      fetchCart();
    } else {
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
      
      // Ждем, если продукты еще не загружены
      if (products.length === 0) {
        await fetchProducts();
      }
      
      const cartWithProducts = response.data.map(cartItem => {
        const product = products.find(p => p.id === cartItem.product_id);
        // Если продукт не найден в текущем состоянии, пробуем найти в загруженных
        if (!product) {
          console.warn(`Product ${cartItem.product_id} not found`);
          return {
            id: cartItem.product_id,
            name: 'Товар временно недоступен',
            price: '0 ₽',
            description: '',
            imageUrl: '/images/no-image.png',
            quantity: cartItem.quantity,
            cartId: cartItem.id
          };
        }
        
        return {
          id: cartItem.product_id,
          name: product.name || 'Товар',
          price: product.price || '0 ₽',
          description: product.description || '',
          imageUrl: product.imageUrl || '/images/no-image.png',
          quantity: cartItem.quantity,
          cartId: cartItem.id
        };
      });
      
      setCartItems(cartWithProducts);
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
    }
  };

  const syncLocalCartWithServer = async () => {
    const localCart = localStorage.getItem('localCart');
    if (!localCart) return;

    const localCartItems = JSON.parse(localCart);
    if (localCartItems.length === 0) return;

    console.log('Синхронизация локальной корзины с сервером...', localCartItems);
    
    // Ждем загрузки продуктов
    if (products.length === 0) {
      await fetchProducts();
    }

    try {
      for (const item of localCartItems) {
        const existingResponse = await axios.get(`${API_URL}/cart.php?user_id=${user.id}&product_id=${item.id}`);
        
        if (existingResponse.data && existingResponse.data.length > 0) {
          const cartItemId = existingResponse.data[0].id;
          const newQuantity = existingResponse.data[0].quantity + item.quantity;
          await axios.put(`${API_URL}/cart.php?id=${cartItemId}`, { quantity: newQuantity });
        } else {
          for (let i = 0; i < item.quantity; i++) {
            await axios.post(`${API_URL}/cart.php`, {
              user_id: user.id,
              product_id: item.id,
              quantity: 1
            });
          }
        }
      }
      
      localStorage.removeItem('localCart');
      console.log('Локальная корзина синхронизирована и очищена');
      await fetchCart();
    } catch (error) {
      console.error('Ошибка синхронизации корзины:', error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      const newCart = [...cartItems];
      const existingItem = newCart.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        newCart.push({ ...product, quantity: quantity });
      }
      
      setCartItems(newCart);
      localStorage.setItem('localCart', JSON.stringify(newCart));
      return;
    }

    try {
      const checkResponse = await axios.get(`${API_URL}/cart.php?user_id=${user.id}&product_id=${product.id}`);
      
      if (checkResponse.data && checkResponse.data.length > 0) {
        const cartItemId = checkResponse.data[0].id;
        const newQuantity = checkResponse.data[0].quantity + quantity;
        await axios.put(`${API_URL}/cart.php?id=${cartItemId}`, { quantity: newQuantity });
      } else {
        for (let i = 0; i < quantity; i++) {
          await axios.post(`${API_URL}/cart.php`, {
            user_id: user.id,
            product_id: product.id,
            quantity: 1
          });
        }
      }
      
      // Обновляем локальное состояние
      const existingItemInState = cartItems.find(item => item.id === product.id);
      if (existingItemInState) {
        setCartItems(prevItems => 
          prevItems.map(item => 
            item.id === product.id 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        );
      } else {
        const newItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description,
          imageUrl: product.imageUrl,
          quantity: quantity
        };
        setCartItems(prevItems => [...prevItems, newItem]);
      }
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      await fetchCart();
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
      const cartItem = cartItems.find(item => item.id === id);
      if (cartItem && cartItem.cartId) {
        await axios.delete(`${API_URL}/cart.php?id=${cartItem.cartId}`);
      }
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Ошибка удаления из корзины:', error);
      await fetchCart();
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
      const cartItem = cartItems.find(item => item.id === id);
      if (cartItem && cartItem.cartId) {
        await axios.put(`${API_URL}/cart.php?id=${cartItem.cartId}`, { quantity });
      }
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Ошибка обновления количества:', error);
      await fetchCart();
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
      updateCartItemQuantity,
      refreshCart: fetchCart // Добавляем метод для ручного обновления
    }}>
      {children}
    </CartContext.Provider>
  );
};