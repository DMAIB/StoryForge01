import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';
import './MyOrders.css';

const MyOrders = () => {
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

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
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
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
    <div className="my-orders">
      <h2>📋 Мои заказы</h2>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>У вас пока нет заказов.</p>
          <a href="/" className="continue-shopping-btn">Перейти в магазин</a>
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
                  <div className="delivery-info">
                    <h4>Адрес доставки</h4>
                    <p>{order.delivery_address}</p>
                  </div>
                  
                  <div className="payment-info">
                    <h4>Способ оплаты</h4>
                    <p>
                      {order.payment_method === 'card' && 'Банковская карта'}
                      {order.payment_method === 'cash' && 'Наличные при получении'}
                      {order.payment_method === 'online' && 'Онлайн-кошелек'}
                    </p>
                  </div>
                  
                  <div className="order-items">
                    <h4>Товары в заказе</h4>
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
                          const priceNum = parseInt(item.product_price.replace(/[^0-9.-]+/g, ''));
                          const total = priceNum * item.quantity;
                          return (
                            <tr key={index}>
                              <td>{item.product_name}</td>
                              <td>{item.product_price}</td>
                              <td>{item.quantity}</td>
                              <td>{total.toLocaleString()} ₽</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3" className="total-label">Итого:</td>
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
  );
};

export default MyOrders;