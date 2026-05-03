import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from './CartContext';
import { UserContext } from './UserContext';
import ProductImage from './ProductImage';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, clearCart, updateCartItemQuantity } = useCart();
  const { user, updateUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Состояния для оплаты
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // Состояния для адреса (только для текущего заказа)
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryAddressFull, setDeliveryAddressFull] = useState('');

  // Состояние для выбранных товаров
  const [selectedItems, setSelectedItems] = useState(new Set());
  
  // Используем useRef чтобы отследить состояние
  const buyNowAppliedRef = useRef(false);
  const buyNowProductIdRef = useRef(null);
  const manualSelectionRef = useRef(false); // Флаг для ручного снятия/выделения

  // Заглушка для фото (локальная)
  const NO_IMAGE_URL = '/images/no-image.png';

  // При монтировании - сохраняем ID из localStorage, но НЕ ОЧИЩАЕМ его
  useEffect(() => {
    const buyNowId = localStorage.getItem('buyNowProductId');
    console.log('Cart mounted, buyNowProductId from localStorage:', buyNowId);
    if (buyNowId) {
      buyNowProductIdRef.current = parseInt(buyNowId);
      // НЕ удаляем localStorage здесь! Удалим только после применения выделения
    }
  }, []);

  // Функция для очистки невалидных ID из selectedItems
  const cleanSelectedItems = () => {
    const existingIds = new Set(cartItems.map(item => item.id));
    const validSelected = new Set();
    selectedItems.forEach(id => {
      if (existingIds.has(id)) {
        validSelected.add(id);
      }
    });
    if (validSelected.size !== selectedItems.size) {
      setSelectedItems(validSelected);
    }
  };

  // Обертка для удаления товара
  const handleRemoveFromCart = (itemId) => {
    const newSelected = new Set(selectedItems);
    newSelected.delete(itemId);
    setSelectedItems(newSelected);
    removeFromCart(itemId);
    // Если пользователь удалил товар, отмечаем что было ручное действие
    manualSelectionRef.current = true;
  };

  // Обертка для очистки корзины
  const handleClearCart = () => {
    setSelectedItems(new Set());
    clearCart();
    manualSelectionRef.current = true;
  };

  // Выделить все товары
  const selectAllItems = () => {
    cleanSelectedItems();
    const newSelected = new Set(cartItems.map(item => item.id));
    setSelectedItems(newSelected);
    manualSelectionRef.current = true; // Отмечаем, что пользователь выбрал вручную
  };

  // Снять выделение со всех товаров
  const deselectAllItems = () => {
    setSelectedItems(new Set());
    manualSelectionRef.current = true; // Отмечаем, что пользователь снял выделение вручную
  };

  // Переключить выделение товара
  const toggleItemSelection = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    manualSelectionRef.current = true; // Отмечаем, что пользователь менял выделение
  };

  // Проверить, выделены ли все товары
  const isAllSelected = () => {
    return cartItems.length > 0 && selectedItems.size === cartItems.length;
  };

  // Получить выбранные товары
  const getSelectedItems = () => {
    return cartItems.filter(item => selectedItems.has(item.id));
  };

  // Получить общую сумму выбранных товаров
  const getSelectedTotalPrice = () => {
    return getSelectedItems().reduce((total, item) => {
      const price = parseInt(item.price.replace(/[^0-9.-]+/g, ''));
      return total + (price * item.quantity);
    }, 0);
  };

  // Загружаем адрес из профиля при открытии модального окна
  useEffect(() => {
    if (showPaymentModal && user) {
      if (user.address) {
        setDeliveryAddress(user.address);
        setDeliveryAddressFull(user.address);
      } else {
        setDeliveryAddress('');
        setDeliveryAddressFull('');
      }
    }
  }, [showPaymentModal, user]);

  // Основная логика выделения товаров
  useEffect(() => {
    console.log('=== Cart selection effect ===');
    console.log('cartItems length:', cartItems.length);
    console.log('buyNowAppliedRef.current:', buyNowAppliedRef.current);
    console.log('buyNowProductIdRef.current:', buyNowProductIdRef.current);
    console.log('selectedItems.size:', selectedItems.size);
    console.log('manualSelectionRef.current:', manualSelectionRef.current);
    
    // Если корзина пуста, сбрасываем флаги
    if (cartItems.length === 0) {
      buyNowAppliedRef.current = false;
      buyNowProductIdRef.current = null;
      manualSelectionRef.current = false;
      return;
    }
    
    // Если есть buyNow ID и мы еще не применили выделение
    if (buyNowProductIdRef.current !== null && !buyNowAppliedRef.current) {
      console.log('Applying buyNow selection for product ID:', buyNowProductIdRef.current);
      
      const targetItem = cartItems.find(item => item.id === buyNowProductIdRef.current);
      
      if (targetItem) {
        const newSelected = new Set();
        newSelected.add(targetItem.id);
        setSelectedItems(newSelected);
        buyNowAppliedRef.current = true;
        console.log('Selected only:', targetItem.name);
        
        // ТЕПЕРЬ можно очистить localStorage
        localStorage.removeItem('buyNowProductId');
        console.log('Cleared localStorage');
      } else {
        console.log('Target product not found in cart yet, waiting...');
      }
      return;
    }
    
    // Если пользователь вручную менял выделение - НЕ трогаем
    if (manualSelectionRef.current) {
      console.log('Manual selection was made, skipping auto selection');
      return;
    }
    
    // Если buyNow не активен, выделяем все (только если ничего не выбрано)
    if (!buyNowAppliedRef.current && selectedItems.size === 0 && cartItems.length > 0) {
      console.log('No buyNow, selecting all items');
      const newSelected = new Set(cartItems.map(item => item.id));
      setSelectedItems(newSelected);
    }
  }, [cartItems, selectedItems.size]);

  const handleBuyClick = () => {
    const selectedItemsList = getSelectedItems();
    
    if (selectedItemsList.length === 0) {
      alert('Пожалуйста, выберите хотя бы один товар для оформления заказа');
      return;
    }
    
    if (!user) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleAddressChange = (e) => {
    setDeliveryAddressFull(e.target.value);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!deliveryAddressFull.trim()) {
      alert('Пожалуйста, укажите адрес доставки');
      return;
    }
    
    if (paymentMethod === 'card') {
      if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
        alert('Пожалуйста, заполните все поля карты');
        return;
      }
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        alert('Введите корректный номер карты (16 цифр)');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      const selectedItemsList = getSelectedItems();
      
      const orderData = {
        user_id: user.id,
        delivery_address: deliveryAddressFull,
        payment_method: paymentMethod,
        total_price: getSelectedTotalPrice(),
        items: selectedItemsList.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };
      
      const response = await fetch('http://localhost/StoryForge/api/create_order.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Удаляем только выбранные товары из корзины
        for (const item of selectedItemsList) {
          await removeFromCart(item.id);
        }
        
        // Очищаем выбранные товары
        setSelectedItems(new Set());
        
        alert(`Заказ №${result.order_number} успешно оформлен! Спасибо за покупку!`);
        setShowPaymentModal(false);
        resetPaymentForm();
        // Перенаправляем на страницу заказов
        navigate('/my-orders', { state: { newOrderNumber: result.order_number } });
      } else {
        alert('Ошибка: ' + result.message);
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  };

  const resetPaymentForm = () => {
    setPaymentMethod('card');
    setCardNumber('');
    setCardName('');
    setCardExpiry('');
    setCardCvv('');
    if (user?.address) {
      setDeliveryAddress(user.address);
      setDeliveryAddressFull(user.address);
    } else {
      setDeliveryAddress('');
      setDeliveryAddressFull('');
    }
  };

  const closeModal = () => {
    setShowPaymentModal(false);
    resetPaymentForm();
  };

  const handleCardNumberInput = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(value);
  };

  const handleCardExpiryInput = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setCardExpiry(value);
  };

  const handleCardCvvInput = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCardCvv(value);
  };

  const totalPrice = cartItems.reduce((total, item) => {
    const price = parseInt(item.price.replace(/[^0-9.-]+/g, ''));
    return total + (price * item.quantity);
  }, 0);

  const selectedTotalPrice = getSelectedTotalPrice();

  return (
    <div className="cart">
      <h2>Корзина</h2>
      {cartItems.length === 0 ? (
        <p className="empty-cart-message">🛒 В корзине пока пусто.</p>
      ) : (
        <div>
          {/* Панель управления выделением */}
          <div className="cart-selection-controls">
            <div className="selection-buttons">
              <button 
                className={`selection-btn ${isAllSelected() ? 'active' : ''}`}
                onClick={selectAllItems}
              >
                Выделить все
              </button>
              <button 
                className="selection-btn"
                onClick={deselectAllItems}
              >
                Снять все
              </button>
            </div>
            <div className="selection-info">
              Выбрано: {selectedItems.size} / {cartItems.length} товаров
            </div>
          </div>

          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              {/* Чекбокс для выбора товара */}
              <div className="cart-item-checkbox">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  className="item-checkbox"
                />
              </div>
              
              <ProductImage 
                src={item.imageUrl} 
                alt={item.name} 
                className="cart-item-image" 
                placeholder={NO_IMAGE_URL}
              />
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p className="cart-item-description">{item.description || 'Описание отсутствует'}</p>
                <p className="cart-item-price">{item.price}</p>
                <div className="quantity-control">
                  <button onClick={() => updateCartItemQuantity(item.id, Math.max(item.quantity - 1, 1))}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
              </div>
              <button className="remove-button" onClick={() => handleRemoveFromCart(item.id)}>✕</button>
            </div>
          ))}
          
          <div className="total-price">
            <h3>Итого: {totalPrice.toLocaleString()} ₽</h3>
            {selectedTotalPrice !== totalPrice && (
              <h3 className="selected-total">
                Сумма выбранных: {selectedTotalPrice.toLocaleString()} ₽
              </h3>
            )}
          </div>
          
          <button 
            className="buy-button" 
            onClick={handleBuyClick}
            disabled={selectedItems.size === 0}
          >
            {!user ? '🚪 Войдите для оформления заказа' : 
             selectedItems.size === 0 ? 'Выберите товары для заказа' : 
             `Оформить заказ (${selectedItems.size})`}
          </button>
        </div>
      )}

      {/* Модальное окно оплаты */}
      {showPaymentModal && user && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <h2>Оформление заказа</h2>
            
            <div className="user-info-summary">
              <h3>Данные получателя:</h3>
              <p><strong>Имя:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Телефон:</strong> {user.phone}</p>
            </div>
            
            {/* Список выбранных товаров в модальном окне */}
            <div className="selected-items-summary">
              <h3>Выбранные товары:</h3>
              {getSelectedItems().map(item => (
                <div key={item.id} className="selected-item-row">
                  <span>{item.name}</span>
                  <span>x{item.quantity}</span>
                  <span>{parseInt(item.price.replace(/[^0-9.-]+/g, '')).toLocaleString()} ₽</span>
                </div>
              ))}
              <div className="selected-total-summary">
                Итого: {selectedTotalPrice.toLocaleString()} ₽
              </div>
            </div>
            
            <form onSubmit={handlePaymentSubmit}>
              {/* Блок ввода адреса */}
              <div className="address-section">
                <label className="section-label">📍 Адрес доставки *</label>
                
                {user.address && (
                  <div className="address-option">
                    <p className="saved-address-info">
                      <strong>Ваш основной адрес:</strong> {user.address}
                    </p>
                    <p className="address-hint">
                      Вы можете использовать его или ввести новый адрес для этого заказа
                    </p>
                  </div>
                )}
                
                <div className="new-address-form">
                  <label htmlFor="deliveryAddress">Введите адрес доставки:</label>
                  <textarea
                    id="deliveryAddress"
                    value={deliveryAddressFull}
                    onChange={handleAddressChange}
                    placeholder="Введите полный адрес доставки (город, улица, дом, квартира)"
                    rows="3"
                    className="address-textarea"
                  />
                  {!deliveryAddressFull && user.address && (
                    <button 
                      type="button"
                      className="use-saved-address-btn"
                      onClick={() => setDeliveryAddressFull(user.address)}
                    >
                      Использовать сохраненный адрес
                    </button>
                  )}
                </div>
              </div>

              <div className="payment-methods">
                <label className="section-label">💳 Способ оплаты *</label>
                <label className="payment-method">
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Банковская карта
                </label>
                <label className="payment-method">
                  <input
                    type="radio"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Наличные при получении
                </label>
                <label className="payment-method">
                  <input
                    type="radio"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Онлайн-кошелек
                </label>
              </div>

              {paymentMethod === 'card' && (
                <div className="card-details">
                  <div className="form-group">
                    <label>Номер карты</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberInput}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                  </div>
                  <div className="form-group">
                    <label>Имя владельца</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      placeholder="IVAN IVANOV"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Срок действия</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleCardExpiryInput}
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV/CVC</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={handleCardCvvInput}
                        placeholder="123"
                        maxLength="3"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'online' && (
                <div className="online-payment">
                  <p>Выберите способ оплаты:</p>
                  <select className="payment-select">
                    <option>Qiwi Wallet</option>
                    <option>YooMoney</option>
                    <option>WebMoney</option>
                    <option>PayPal</option>
                  </select>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="cash-payment">
                  <p>Оплата наличными при получении заказа.</p>
                </div>
              )}

              <button type="submit" className="confirm-payment-btn" disabled={loading}>
                {loading ? 'Оформление...' : `Подтвердить заказ на ${selectedTotalPrice.toLocaleString()} ₽`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;