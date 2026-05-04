import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';
import './AdminOrders.css';

const AdminOrders = () => {
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost/StoryForge/api/get_all_orders.php');
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Ошибка загрузки заказов: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      const response = await fetch('http://localhost/StoryForge/api/update_order_status.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          status: newStatus
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        alert('Статус заказа обновлен');
      } else {
        alert('Ошибка: ' + data.message);
      }
    } catch (error) {
      alert('Ошибка при обновлении статуса: ' + error.message);
    } finally {
      setUpdatingStatus(null);
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
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusOptions = () => {
    return [
      { value: 'pending', label: 'Ожидает обработки' },
      { value: 'processing', label: 'В обработке' },
      { value: 'shipped', label: 'Отправлен' },
      { value: 'delivered', label: 'Доставлен' },
      { value: 'cancelled', label: 'Отменён' }
    ];
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-orders">
        <div className="access-denied">
          <h2>⛔ Доступ запрещен</h2>
          <p>У вас нет прав для просмотра этой страницы.</p>
          <a href="/products">Вернуться на главную</a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-orders">
        <h2>📋 Управление заказами</h2>
        <div className="loading-spinner">Загрузка заказов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-orders">
        <h2>📋 Управление заказами</h2>
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={fetchOrders} className="retry-btn">Повторить</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders">
      <h2>📋 Управление заказами</h2>
      
      <div className="stats-container">
        <div className="stat-card total">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Всего заказов</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-value">{stats.pending}</span>
          <span className="stat-label">Ожидают</span>
        </div>
        <div className="stat-card processing">
          <span className="stat-value">{stats.processing}</span>
          <span className="stat-label">В обработке</span>
        </div>
        <div className="stat-card shipped">
          <span className="stat-value">{stats.shipped}</span>
          <span className="stat-label">Отправлены</span>
        </div>
        <div className="stat-card delivered">
          <span className="stat-value">{stats.delivered}</span>
          <span className="stat-label">Доставлены</span>
        </div>
        <div className="stat-card cancelled">
          <span className="stat-value">{stats.cancelled}</span>
          <span className="stat-label">Отменены</span>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Статус:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Все</option>
            <option value="pending">Ожидает обработки</option>
            <option value="processing">В обработке</option>
            <option value="shipped">Отправлен</option>
            <option value="delivered">Доставлен</option>
            <option value="cancelled">Отменён</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Поиск:</label>
          <input
            type="text"
            placeholder="Номер заказа, имя или email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button onClick={fetchOrders} className="refresh-btn">🔄 Обновить</button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <p>Заказы не найдены</p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div key={order.id} className={`order-card ${order.status === 'cancelled' ? 'cancelled-order' : ''}`}>
              <div className="order-header" onClick={() => toggleOrderDetails(order.id)}>
                <div className="order-info">
                  <span className="order-number">Заказ #{order.order_number}</span>
                  <span className="order-date">{formatDate(order.created_at)}</span>
                  <span className="order-user">
                    👤 {order.user_name} ({order.user_email})
                  </span>
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
                  <div className="status-update">
                    <label>Изменить статус:</label>
                    <select 
                      value={order.status} 
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      disabled={updatingStatus === order.id}
                    >
                      {getStatusOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {updatingStatus === order.id && <span className="updating">Обновление...</span>}
                  </div>

                  {/* Информация об отмене, если заказ отменен */}
                  {order.status === 'cancelled' && (
                    <div className="admin-cancelled-info">
                      <span className="cancelled-icon">⚠️</span>
                      <span className="cancelled-text">Заказ был отменен пользователем</span>
                    </div>
                  )}

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
                          // Правильное получение цены
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
                        {/* Доставка как отдельная строка в теле таблицы */}
                        <tr className="delivery-item-row">
                          <td className="delivery-name">Доставка</td>
                          <td className="delivery-price-cell">{Number(order.delivery_price || 0).toLocaleString()} ₽</td>
                          <td className="delivery-quantity">1</td>
                          <td className="delivery-total">{Number(order.delivery_price || 0).toLocaleString()} ₽</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="total-row">
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

export default AdminOrders;