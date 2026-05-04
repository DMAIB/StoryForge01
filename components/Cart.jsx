import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from './CartContext';
import { UserContext } from './UserContext';
import ProductImage from './ProductImage';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, clearCart, updateCartItemQuantity, refreshCart } = useCart();
  const { user, updateUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState({
    orderNumber: '',
    subtotal: 0,
    delivery: 0,
    total: 0,
    address: ''
  });
  
  // Состояния для диалогов подтверждения
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
  const [showRemoveItemConfirm, setShowRemoveItemConfirm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  
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
  
  // Константы для доставки
  const FREE_DELIVERY_THRESHOLD = 3000;
  const REDUCED_DELIVERY_THRESHOLD = 1500;
  const STANDARD_DELIVERY_PRICE = 500;
  const REDUCED_DELIVERY_PRICE = 250;
  
  // Используем useRef чтобы отследить состояние
  const buyNowAppliedRef = useRef(false);
  const buyNowProductIdRef = useRef(null);
  const manualSelectionRef = useRef(false);

  // Заглушка для фото (локальная)
  const NO_IMAGE_URL = '/images/no-image.png';

  // Функция для расчета стоимости доставки
  const getDeliveryPrice = () => {
    const subtotal = getSelectedTotalPrice();
    if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
    if (subtotal >= REDUCED_DELIVERY_THRESHOLD) return REDUCED_DELIVERY_PRICE;
    return STANDARD_DELIVERY_PRICE;
  };

  // Функция для получения общей суммы с доставкой
  const getTotalWithDelivery = () => {
    return getSelectedTotalPrice() + getDeliveryPrice();
  };

  // Проверка и обновление корзины при неполных данных
  useEffect(() => {
    if (cartItems.length > 0) {
      const hasInvalidItems = cartItems.some(item => 
        !item.name || 
        item.name === 'Товар' || 
        !item.price || 
        item.price === '0 ₽' ||
        item.price === '0₽'
      );
      
      if (hasInvalidItems && refreshCart) {
        console.log('Обнаружены некорректные данные в корзине, обновляем...');
        refreshCart();
      }
    }
  }, [cartItems, refreshCart]);

  // При монтировании - сохраняем ID из localStorage
  useEffect(() => {
    const buyNowId = localStorage.getItem('buyNowProductId');
    console.log('Cart mounted, buyNowProductId from localStorage:', buyNowId);
    if (buyNowId) {
      buyNowProductIdRef.current = parseInt(buyNowId);
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

  // Функция для подтверждения удаления товара
  const confirmRemoveItem = (itemId) => {
    setItemToRemove(itemId);
    setShowRemoveItemConfirm(true);
  };

  // Функция для выполнения удаления товара
  const handleRemoveFromCart = () => {
    if (itemToRemove) {
      const newSelected = new Set(selectedItems);
      newSelected.delete(itemToRemove);
      setSelectedItems(newSelected);
      removeFromCart(itemToRemove);
      manualSelectionRef.current = true;
      setShowRemoveItemConfirm(false);
      setItemToRemove(null);
    }
  };

  // Функция для подтверждения очистки корзины
  const confirmClearCart = () => {
    setShowClearCartConfirm(true);
  };

  // Функция для выполнения очистки корзины
  const handleClearCart = () => {
    setSelectedItems(new Set());
    clearCart();
    manualSelectionRef.current = true;
    setShowClearCartConfirm(false);
  };

  // Выделить все товары
  const selectAllItems = () => {
    cleanSelectedItems();
    const newSelected = new Set(cartItems.map(item => item.id));
    setSelectedItems(newSelected);
    manualSelectionRef.current = true;
  };

  // Снять выделение со всех товаров
  const deselectAllItems = () => {
    setSelectedItems(new Set());
    manualSelectionRef.current = true;
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
    manualSelectionRef.current = true;
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
    if (cartItems.length === 0) {
      buyNowAppliedRef.current = false;
      buyNowProductIdRef.current = null;
      manualSelectionRef.current = false;
      return;
    }
    
    if (buyNowProductIdRef.current !== null && !buyNowAppliedRef.current) {
      const targetItem = cartItems.find(item => item.id === buyNowProductIdRef.current);
      
      if (targetItem) {
        const newSelected = new Set();
        newSelected.add(targetItem.id);
        setSelectedItems(newSelected);
        buyNowAppliedRef.current = true;
        localStorage.removeItem('buyNowProductId');
      }
      return;
    }
    
    if (manualSelectionRef.current) {
      return;
    }
    
    if (!buyNowAppliedRef.current && selectedItems.size === 0 && cartItems.length > 0) {
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

  // Компонент модального окна подтверждения
  const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Да", cancelText = "Нет" }) => {
    if (!isOpen) return null;
    
    return (
      <div className="modal-overlay confirm-dialog-overlay" onClick={onClose}>
        <div className="modal-content confirm-dialog-content" onClick={(e) => e.stopPropagation()}>
          <h3>{title}</h3>
          <p>{message}</p>
          <div className="confirm-dialog-buttons">
            <button className="confirm-dialog-btn cancel" onClick={onClose}>
              {cancelText}
            </button>
            <button className="confirm-dialog-btn confirm" onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Компонент модального окна успеха
  const SuccessModal = ({ isOpen, onClose, orderData }) => {
    if (!isOpen) return null;

    return (
      <div className="modal-overlay success-modal-overlay" onClick={onClose}>
        <div className="modal-content success-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>✕</button>
          
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h2 className="success-title">✓ Заказ успешно оформлен!</h2>
          
          <div className="order-details">
            <div className="order-detail-row">
              <span className="detail-label">Номер заказа:</span>
              <span className="detail-value order-number">{orderData.orderNumber}</span>
            </div>
            
            <div className="order-detail-divider"></div>
            
            <div className="order-detail-row">
              <span className="detail-label">Товары:</span>
              <span className="detail-value">{orderData.subtotal.toLocaleString()} ₽</span>
            </div>
            
            <div className="order-detail-row">
              <span className="detail-label">Доставка:</span>
              <span className="detail-value" style={{ color: orderData.delivery === 0 ? '#4caf50' : '#666' }}>
                {orderData.delivery === 0 ? 'Бесплатно' : `${orderData.delivery.toLocaleString()} ₽`}
              </span>
            </div>
            
            <div className="order-detail-total">
              <span className="detail-label">Итого к оплате:</span>
              <span className="detail-value total-amount">{orderData.total.toLocaleString()} ₽</span>
            </div>
            
            <div className="order-detail-divider"></div>
            
            <div className="order-detail-row address-row">
              <span className="detail-label">📍 Адрес доставки:</span>
              <span className="detail-value address-value">{orderData.address}</span>
            </div>
          </div>
          
          <div className="success-thanks">
            <p>Спасибо за покупку! 🎉</p>
            <p className="thanks-subtitle">Мы свяжемся с вами в ближайшее время для подтверждения заказа.</p>
          </div>
          
          <div className="success-actions">
            <button className="success-btn primary" onClick={onClose}>
              Продолжить покупки
            </button>
            <button className="success-btn secondary" onClick={() => {
              onClose();
              navigate('/my-orders');
            }}>
              Мои заказы
            </button>
          </div>
        </div>
      </div>
    );
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
      const subtotalPrice = getSelectedTotalPrice();
      const deliveryPrice = getDeliveryPrice();
      const totalPrice = subtotalPrice + deliveryPrice;
      
      let updatedUser = user;
      if (!user.address && deliveryAddressFull.trim()) {
        try {
          const updateUserResponse = await fetch('http://localhost/StoryForge/api/update_profile.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              address: deliveryAddressFull.trim(),
              photo: user.photo || null
            }),
          });
          
          const updateUserData = await updateUserResponse.json();
          
          if (updateUserData.success) {
            updateUser(updateUserData.user);
            updatedUser = updateUserData.user;
          }
        } catch (updateError) {
          console.error('Ошибка при обновлении профиля:', updateError);
        }
      }
      
      const orderData = {
        user_id: updatedUser.id,
        delivery_address: deliveryAddressFull,
        payment_method: paymentMethod,
        subtotal_price: subtotalPrice,
        delivery_price: deliveryPrice,
        total_price: totalPrice,
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
        for (const item of selectedItemsList) {
          await removeFromCart(item.id);
        }
        
        setSelectedItems(new Set());
        
        // Устанавливаем данные для успешного модального окна
        setOrderSuccessData({
          orderNumber: result.order_number,
          subtotal: subtotalPrice,
          delivery: deliveryPrice,
          total: totalPrice,
          address: deliveryAddressFull
        });
        
        // Закрываем платежное модальное окно
        setShowPaymentModal(false);
        // Открываем модальное окно успеха
        setShowSuccessModal(true);
        
        resetPaymentForm();
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
    const price = parseInt(item.price?.replace(/[^0-9.-]+/g, '') || '0');
    return total + (price * item.quantity);
  }, 0);

  const selectedTotalPrice = getSelectedTotalPrice();
  const deliveryPrice = getDeliveryPrice();
  const totalWithDelivery = getTotalWithDelivery();

  // Текст для отображения стоимости доставки
  const getDeliveryText = () => {
    if (deliveryPrice === 0) {
      return { text: 'Бесплатно', class: 'free-delivery' };
    }
    return { text: `${deliveryPrice.toLocaleString()} ₽`, class: '' };
  };

  const deliveryInfo = getDeliveryText();

  // Находим имя товара для удаления
  const itemToRemoveName = itemToRemove 
    ? cartItems.find(item => item.id === itemToRemove)?.name || 'товар'
    : '';

  return (
    <div className="cart">
      <ConfirmDialog
        isOpen={showClearCartConfirm}
        onClose={() => setShowClearCartConfirm(false)}
        onConfirm={handleClearCart}
        title="Очистка корзины"
        message="Вы действительно хотите удалить все товары из корзины? Это действие нельзя отменить."
        confirmText="Да, очистить"
        cancelText="Отмена"
      />
      
      <ConfirmDialog
        isOpen={showRemoveItemConfirm}
        onClose={() => {
          setShowRemoveItemConfirm(false);
          setItemToRemove(null);
        }}
        onConfirm={handleRemoveFromCart}
        title="Удаление товара"
        message={`Вы действительно хотите удалить "${itemToRemoveName}" из корзины?`}
        confirmText="Да, удалить"
        cancelText="Отмена"
      />
      
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
        orderData={orderSuccessData}
      />
      
      <h2>Корзина</h2>
      {cartItems.length === 0 ? (
        <p className="empty-cart-message">🛒 В корзине пока пусто.</p>
      ) : (
        <div>
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
              <button 
                className="selection-btn clear-cart-btn"
                onClick={confirmClearCart}
              >
                Очистить корзину
              </button>
            </div>
            <div className="selection-info">
              Выбрано: {selectedItems.size} / {cartItems.length} товаров
            </div>
          </div>

          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
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
                alt={item.name || 'Товар'} 
                className="cart-item-image" 
                placeholder={NO_IMAGE_URL}
              />
              <div className="cart-item-details">
                <h3>{item.name || 'Товар'}</h3>
                <p className="cart-item-description">{item.description || 'Описание отсутствует'}</p>
                <p className="cart-item-price">{item.price || '0 ₽'}</p>
                <div className="quantity-control">
                  <button onClick={() => updateCartItemQuantity(item.id, Math.max(item.quantity - 1, 1))}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
              </div>
              <button className="remove-button" onClick={() => confirmRemoveItem(item.id)}>✕</button>
            </div>
          ))}
          
          <div className="total-price">
            <h3>Итого: {totalPrice.toLocaleString()} ₽</h3>
            {selectedTotalPrice !== totalPrice && (
              <h3 className="selected-total">
                Сумма выбранных товаров: {selectedTotalPrice.toLocaleString()} ₽
              </h3>
            )}
          </div>
          
          <button 
            className="buy-button" 
            onClick={handleBuyClick}
            disabled={selectedItems.size === 0}
          >
            {!user ? 'Войдите для оформления заказа' : 
             selectedItems.size === 0 ? 'Выберите товары для заказа' : 
             `Оформить заказ (${selectedItems.size})`}
          </button>
        </div>
      )}

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
            
            <div className="selected-items-summary">
              <h3>Выбранные товары:</h3>
              {getSelectedItems().map(item => (
                <div key={item.id} className="selected-item-row">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{parseInt(item.price?.replace(/[^0-9.-]+/g, '') || '0').toLocaleString()}₽</span>
                </div>
              ))}
              
              <div className="delivery-row" style={{fontWeight: '700', fontSize: '16px'}}>
                <span>Доставка:</span>
                <span className={deliveryInfo.class} style={{ color: '#4caf50' }}>
                  {deliveryInfo.text}
                </span>
              </div>
              
              {deliveryPrice === 0 && selectedTotalPrice < FREE_DELIVERY_THRESHOLD && (
                <div className="delivery-notice">
                  <small>Для бесплатной доставки нужно набрать товаров на {FREE_DELIVERY_THRESHOLD.toLocaleString()} ₽</small>
                </div>
              )}
              
              {deliveryPrice === REDUCED_DELIVERY_PRICE && (
                <div className="delivery-notice">
                  <small>Добавьте товаров на {(FREE_DELIVERY_THRESHOLD - selectedTotalPrice).toLocaleString()} ₽ и получите бесплатную доставку!</small>
                </div>
              )}
              
              <div className="selected-total-summary">
                Итого к оплате: {totalWithDelivery.toLocaleString()} ₽
              </div>
            </div>
            
            <form onSubmit={handlePaymentSubmit}>
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
                  
                  {!user?.address && (
                    <div className="address-hint-save" style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                      <small>💡 Адрес будет сохранён в ваш профиль для следующих заказов</small>
                    </div>
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
                {loading ? 'Оформление...' : `Подтвердить заказ на ${totalWithDelivery.toLocaleString()} ₽`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;