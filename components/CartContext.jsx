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
      syncLocalCartWithServer(); // Синхронизируем локальную корзину с сервером
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

  // НОВАЯ ФУНКЦИЯ: Синхронизация локальной корзины с сервером при входе
  const syncLocalCartWithServer = async () => {
    const localCart = localStorage.getItem('localCart');
    if (!localCart) return;

    const localCartItems = JSON.parse(localCart);
    if (localCartItems.length === 0) return;

    console.log('Синхронизация локальной корзины с сервером...', localCartItems);

    try {
      // Отправляем все товары из локальной корзины на сервер
      for (const item of localCartItems) {
        // Проверяем, есть ли уже такой товар в корзине пользователя
        const existingResponse = await axios.get(`${API_URL}/cart.php?user_id=${user.id}&product_id=${item.id}`);
        
        if (existingResponse.data && existingResponse.data.length > 0) {
          // Если товар уже есть, обновляем количество
          const cartItemId = existingResponse.data[0].id;
          const newQuantity = existingResponse.data[0].quantity + item.quantity;
          await axios.put(`${API_URL}/cart.php?id=${cartItemId}`, { quantity: newQuantity });
        } else {
          // Если товара нет, добавляем новый
          for (let i = 0; i < item.quantity; i++) {
            await axios.post(`${API_URL}/cart.php`, {
              user_id: user.id,
              product_id: item.id,
              quantity: 1
            });
          }
        }
      }
      
      // После успешной синхронизации очищаем localStorage
      localStorage.removeItem('localCart');
      console.log('Локальная корзина синхронизирована и очищена');
      
      // Перезагружаем корзину с сервера
      await fetchCart();
    } catch (error) {
      console.error('Ошибка синхронизации корзины:', error);
    }
  };

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
      // Преобразуем данные из БД в формат, понятный компонентам
      const cartWithProducts = response.data.map(cartItem => {
        const product = products.find(p => p.id === cartItem.product_id);
        return {
          id: cartItem.product_id,
          name: product?.name || 'Товар',
          price: product?.price || '0 ₽',
          description: product?.description || '',
          imageUrl: product?.imageUrl || '',
          quantity: cartItem.quantity,
          cartId: cartItem.id
        };
      });
      setCartItems(cartWithProducts);
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      // Для неавторизованных - сохраняем в localStorage
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

    // Для авторизованных - сохраняем в БД
    try {
      // Сначала проверяем, есть ли уже такой товар в корзине
      const checkResponse = await axios.get(`${API_URL}/cart.php?user_id=${user.id}&product_id=${product.id}`);
      
      if (checkResponse.data && checkResponse.data.length > 0) {
        // Если товар уже есть, обновляем количество
        const cartItemId = checkResponse.data[0].id;
        const newQuantity = checkResponse.data[0].quantity + quantity;
        await axios.put(`${API_URL}/cart.php?id=${cartItemId}`, { quantity: newQuantity });
      } else {
        // Если товара нет, добавляем новый
        for (let i = 0; i < quantity; i++) {
          await axios.post(`${API_URL}/cart.php`, {
            user_id: user.id,
            product_id: product.id,
            quantity: 1
          });
        }
      }
      
      // Обновляем локальное состояние корзины, не перезагружая всё с сервера
      // Это важно для сохранения выделения при "Купить сейчас"
      const existingItemInState = cartItems.find(item => item.id === product.id);
      if (existingItemInState) {
        // Обновляем существующий товар
        setCartItems(prevItems => 
          prevItems.map(item => 
            item.id === product.id 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        );
      } else {
        // Добавляем новый товар
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
      // Если произошла ошибка, пробуем перезагрузить корзину
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
      // Находим cartId по product id
      const cartItem = cartItems.find(item => item.id === id);
      if (cartItem && cartItem.cartId) {
        await axios.delete(`${API_URL}/cart.php?id=${cartItem.cartId}`);
      }
      // Обновляем локальное состояние
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Ошибка удаления из корзины:', error);
      // Если произошла ошибка, пробуем перезагрузить корзину
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
      // Находим cartId по product id
      const cartItem = cartItems.find(item => item.id === id);
      if (cartItem && cartItem.cartId) {
        await axios.put(`${API_URL}/cart.php?id=${cartItem.cartId}`, { quantity });
      }
      // Обновляем локальное состояние
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Ошибка обновления количества:', error);
      // Если произошла ошибка, пробуем перезагрузить корзину
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
      updateCartItemQuantity
    }}>
      {children}
    </CartContext.Provider>
  );
};