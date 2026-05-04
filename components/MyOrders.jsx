import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';
import './MyOrders.css';

const MyOrders = () => {
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Загрузка заказов для user_id:', user.id);
      const response = await fetch(`http://localhost/StoryForge/api/get_user_orders.php?user_id=${user.id}`);
      const data = await response.json();
      console.log('Ответ от сервера:', data);
      
      if (data.success) {
        setOrders(data.orders);
        console.log('Заказов найдено:', data.orders.length);
      } else {
        console.error('Ошибка загрузки заказов:', data.message);
        setError(data.message);
      }
    } catch (error) {
      console.error('Ошибка запроса:', error);
      setError('Не удалось загрузить заказы. Проверьте соединение с сервером.');
    } finally {
      setLoading(false);
    }
  };

  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedOrder(null);
  };

  const confirmCancelOrder = async () => {
    if (!selectedOrder) return;

    setCancellingOrderId(selectedOrder.id);
    closeCancelModal();
    
    try {
      const response = await fetch('http://localhost/StoryForge/api/cancel_order.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          user_id: user.id
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOrders(orders.map(order => 
          order.id === selectedOrder.id ? { ...order, status: 'cancelled' } : order
        ));
        showNotification('Заказ успешно отменен', 'success');
      } else {
        showNotification('Ошибка при отмене заказа: ' + data.message, 'error');
      }
    } catch (error) {
      showNotification('Ошибка при отмене заказа: ' + error.message, 'error');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const canCancelOrder = (status) => {
    return status === 'pending' || status === 'processing';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '⏳ Ожидает обработки',
      'processing': '🔄 В обработке',
      'shipped': '📦 Отправлен',
      'delivered': '✅ Доставлен',
      'cancelled': '❌ Отменён'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    return `order-status status-${status}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

// Модальное окно отмены заказа
const CancelOrderModal = () => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeCancelModal();
      }
    };
    
    if (showCancelModal) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [showCancelModal]);

  if (!showCancelModal || !selectedOrder) return null;

  return (
    <div className="cancel-order-modal-overlay" onClick={closeCancelModal}>
      <div className="cancel-order-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cancel-order-modal-header">
          <h3>Подтверждение отмены заказа</h3>
          <button className="cancel-order-modal-close" onClick={closeCancelModal}>×</button>
        </div>
        
        <div className="cancel-order-modal-body">
          <div className="cancel-order-warning-icon">⚠️</div>
          
          <p className="cancel-order-confirmation-text">
            Вы действительно хотите отменить заказ <strong>№{selectedOrder.order_number}</strong>?
          </p>
          
          <div className="cancel-order-summary">
            <div className="cancel-order-summary-item">
              <span className="cancel-order-summary-label">📅 Дата заказа:</span>
              <span className="cancel-order-summary-value">{formatDate(selectedOrder.created_at)}</span>
            </div>
            <div className="cancel-order-summary-item">
              <span className="cancel-order-summary-label">💰 Сумма заказа:</span>
              <span className="cancel-order-summary-value">{Number(selectedOrder.total_price).toLocaleString()} ₽</span>
            </div>
            <div className="cancel-order-summary-item">
              <span className="cancel-order-summary-label">📊 Статус:</span>
              <span className="cancel-order-summary-value">
                {selectedOrder.status === 'pending' ? '⏳ Ожидает обработки' : '🔄 В обработке'}
              </span>
            </div>
          </div>
          
          <div className="cancel-order-refund-info">
            <p><strong>💰 Информация о возврате:</strong></p>
            <p>Мы вернем полную стоимость заказа на вашу карту в течение 3-10 рабочих дней.</p>
          </div>
          
          <div className="cancel-order-modal-buttons">
            <button className="cancel-order-btn-secondary" onClick={closeCancelModal}>
              Отмена
            </button>
            <button className="cancel-order-btn-danger" onClick={confirmCancelOrder}>
              Да, отменить заказ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

  if (!user) {
    return (
      <div className="my-orders">
        <div className="not-logged-in">
          <h2>Мои заказы</h2>
          <p>Пожалуйста, <a href="/login">войдите</a>, чтобы просмотреть свои заказы.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-orders">
        <h2>Мои заказы</h2>
        <div className="loading-spinner">Загрузка заказов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-orders">
        <h2>Мои заказы</h2>
        <div className="error-message">
          <p>Ошибка: {error}</p>
          <button onClick={fetchOrders} className="retry-btn">Повторить</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="my-orders">
        <h2>📋 Мои заказы</h2>
        
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>У вас пока нет заказов.</p>
            <a href="/products" className="continue-shopping-btn">Перейти в магазин</a>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div 
                  className="order-header"
                  onClick={() => toggleOrderDetails(order.id)}
                >
                  <div className="order-info">
                    <span className="order-number">Заказ №{order.order_number}</span>
                    <span className="order-date">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="order-summary">
                    <span className="order-total">{Number(order.total_price).toLocaleString()} ₽</span>
                    <span className={getStatusClass(order.status)}>
                      {getStatusText(order.status)}
                    </span>
                    <span className="expand-icon">
                      {expandedOrderId === order.id ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
                
                {expandedOrderId === order.id && (
                  <div className="order-details">
                    {/* Объединенный блок информации о доставке и оплате */}
                    <div className="delivery-payment-block">
                      <div className="info-row">
                        <span className="info-icon">📍</span>
                        <span className="info-label">Адрес доставки:</span>
                        <span className="info-value">{order.delivery_address}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-icon">💳</span>
                        <span className="info-label">Способ оплаты:</span>
                        <span className="info-value">
                          {order.payment_method === 'card' && 'Банковская карта'}
                          {order.payment_method === 'cash' && 'Наличные при получении'}
                          {order.payment_method === 'online' && 'Онлайн-кошелек'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Блок с кнопкой отмены заказа */}
                    {canCancelOrder(order.status) && (
                      <div className="cancel-order-block">
                        <button 
                          onClick={() => openCancelModal(order)}
                          disabled={cancellingOrderId === order.id}
                          className="cancel-order-btn"
                        >
                          {cancellingOrderId === order.id ? 'Отмена...' : '❌ Отменить заказ'}
                        </button>
                        <p className="cancel-info">Вы можете отменить заказ до его отправки. Мы вернем полную стоимость на вашу карту в течение 3–10 рабочих дней.</p>
                      </div>
                    )}
                    
                    {order.status === 'cancelled' && (
                      <div className="cancelled-info">
                        <span className="cancelled-icon">⚠️</span>
                        <span>Заказ был отменен</span>
                      </div>
                    )}
                    
                    <div className="order-items">
                      <h4>🛍 Товары в заказе</h4>
                      <table className="items-table">
                        <thead>
                          <tr>
                            <th>Товар</th>
                            <th>Цена</th>
                            <th>Кол-во</th>
                            <th>Сумма</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items && order.items.map((item, index) => {
                            let priceNum = 0;
                            if (typeof item.product_price === 'string') {
                              priceNum = parseFloat(item.product_price.replace(/[^\d.-]/g, ''));
                            } else {
                              priceNum = parseFloat(item.product_price);
                            }
                            
                            const total = (priceNum || 0) * (item.quantity || 0);
                            
                            return (
                              <tr key={index}>
                                <td className="product-name">{item.product_name}</td>
                                <td className="price-cell">{priceNum.toLocaleString()} ₽</td>
                                <td className="quantity-cell">{item.quantity}</td>
                                <td className="total-cell">{total.toLocaleString()} ₽</td>
                              </tr>
                            );
                          })}
                          <tr className="delivery-item-row">
                            <td className="delivery-name">Доставка</td>
                            <td className="delivery-price-cell">{Number(order.delivery_price || 0).toLocaleString()} ₽</td>
                            <td className="delivery-quantity">1</td>
                            <td className="delivery-total">{Number(order.delivery_price || 0).toLocaleString()} ₽</td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr className="total-row">
                            <td colSpan="3" className="total-label">Итого к оплате:</td>
                            <td className="total-value">{Number(order.total_price).toLocaleString()} ₽</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <CancelOrderModal />
    </>
  );
};

export default MyOrders;