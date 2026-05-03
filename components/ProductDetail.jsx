import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.css';
import { useCart } from './CartContext';
import ProductImage from './ProductImage';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, products } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [notification, setNotification] = useState({ show: false, productName: '', quantity: 0 });
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Заглушка для фото
  const NO_IMAGE_URL = '/images/no-image.png';

  // Функция для правильного склонения
  const getDeclension = (number, forms) => {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
  };

  // Формирование текста уведомления
  const getNotificationText = (quantity) => {
    const qty = Number(quantity);
    const productWord = getDeclension(qty, ['товар', 'товара', 'товаров']);
    const addedWord = qty === 1 ? 'добавлен' : 'добавлено';
    return `${qty} ${productWord} ${addedWord} в корзину!`;
  };

  // СБРОС КОЛИЧЕСТВА ПРИ СМЕНЕ ТОВАРА
  useEffect(() => {
    setQuantity(1);
  }, [id]);

  // Загрузка данных о товаре
  useEffect(() => {
    if (products.length > 0) {
      const foundProduct = products.find(p => p.id === parseInt(id));
      if (foundProduct) {
        setProduct(foundProduct);
        // Получаем похожие товары (из той же категории)
        const category = getProductCategory(foundProduct.name);
        const related = products
          .filter(p => p.id !== parseInt(id) && getProductCategory(p.name) === category)
          .slice(0, 6);
        setRelatedProducts(related);
      } else {
        // Товар не найден
        setProduct(null);
      }
      setLoading(false);
    }
  }, [id, products]);

  // Функция определения категории товара
  const getProductCategory = (name) => {
    if (name.includes('краски') || name.includes('акрил') || name.includes('акварель') || name.includes('гуашь') || name.includes('масляные')) return 'Краски';
    if (name.includes('кисти') || name.includes('линер')) return 'Кисти и инструменты';
    if (name.includes('бумага') || name.includes('альбом') || name.includes('скетчбук') || name.includes('холст')) return 'Бумага и холсты';
    if (name.includes('карандаш') || name.includes('пастель') || name.includes('мелки') || name.includes('фломастер')) return 'Карандаши и пастель';
    if (name.includes('лепка') || name.includes('глина') || name.includes('пластилин')) return 'Лепка';
    if (name.includes('мольберт') || name.includes('палитра') || name.includes('коврик') || name.includes('доска')) return 'Аксессуары';
    if (name.includes('смола') || name.includes('пигмент')) return 'Эпоксидная смола';
    if (name.includes('штамп') || name.includes('трафарет')) return 'Штампы и трафареты';
    if (name.includes('каллиграфия')) return 'Каллиграфия';
    if (name.includes('скрапбукинг') || name.includes('вырубка')) return 'Скрапбукинг';
    return 'Другое';
  };

  // Изменение количества
  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  // Добавление в корзину
  const handleAddToCart = async () => {
    await addToCart(product, quantity);
    setNotification({ 
      show: true, 
      productName: product.name, 
      quantity: quantity 
    });
    setTimeout(() => {
      setNotification({ show: false, productName: '', quantity: 0 });
    }, 2000);
    setQuantity(1);
  };

  // КУПИТЬ СЕЙЧАС - ИСПРАВЛЕННАЯ ВЕРСИЯ
  const handleBuyNow = async () => {
    console.log('=== КУПИТЬ СЕЙЧАС ===');
    console.log('Товар:', product);
    console.log('ID товара:', product.id);
    console.log('Количество:', quantity);
    
    // Ждем добавления в корзину
    await addToCart(product, quantity);
    
    // Сохраняем ID товара в localStorage
    localStorage.setItem('buyNowProductId', product.id);
    console.log('Сохранен ID в localStorage:', product.id);
    
    // Переходим в корзину
    navigate('/cart');
    
    setQuantity(1);
  };
  
  // Навигация к похожему товару
  const handleRelatedProductClick = (productId) => {
    navigate(`/product/${productId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Форматирование цены
  const formatPrice = (price) => {
    if (typeof price === 'string') {
      return price;
    }
    return `${price} ₽`;
  };

  // Парсинг числового значения цены
  const parseNumericPrice = (priceStr) => {
    const match = String(priceStr).match(/(\d+(?:[.,]\d+)?)/);
    return match ? parseFloat(match[1].replace(',', '.')) : 0;
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка товара...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-not-found">
        <div className="not-found-icon">🔍</div>
        <h2>Товар не найден</h2>
        <p>К сожалению, запрашиваемый товар отсутствует в нашем каталоге.</p>
        <button onClick={() => navigate('/products')} className="back-to-catalog-btn">
          Вернуться в каталог
        </button>
      </div>
    );
  }

  const numericPrice = parseNumericPrice(product.price);
  const totalPrice = numericPrice * quantity;

  return (
    <div className="product-detail-container">
      {/* Уведомление */}
      {notification.show && (
        <div className="detail-notification">
          <span className="notification-text">
            {getNotificationText(notification.quantity)}
          </span>
        </div>
      )}

      {/* Хлебные крошки */}
      <div className="breadcrumbs">
        <span onClick={() => navigate('/products')}>Главная</span>
        <span className="separator">/</span>
        <span onClick={() => navigate('/products')}>Каталог</span>
        <span className="separator">/</span>
        <span className="current">{product.name}</span>
      </div>

      {/* Основная информация */}
      <div className="product-detail-main">
        <div className="product-detail-gallery">
          <div className="main-image-container">
            <ProductImage 
              src={product.imageUrl} 
              alt={product.name} 
              className="main-product-image" 
              placeholder={NO_IMAGE_URL}
            />
          </div>
        </div>

        <div className="product-detail-info">
          <h1 className="product-detail-title">{product.name}</h1>
          
          <div className="product-detail-price">
            <span className="price-label">Цена:</span>
            <span className="price-value">{formatPrice(product.price)}</span>
          </div>

          <div className="product-detail-category">
            <span className="category-label">Категория:</span>
            <span className="category-value">{getProductCategory(product.name)}</span>
          </div>

          <div className="product-detail-rating">
            <div className="stars">
              {'★'.repeat(5)}{'☆'.repeat(0)}
            </div>
            <span className="rating-text">5.0 (отзывов: 0)</span>
          </div>

          <div className="product-detail-quantity">
            <label className="quantity-label">Количество:</label>
            <div className="quantity-controls">
              <button 
                className="quantity-control-btn"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="quantity-value">{quantity}</span>
              <button 
                className="quantity-control-btn"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 99}
              >
                +
              </button>
            </div>
            <div className="total-price">
              Итого: {totalPrice.toLocaleString()} ₽
            </div>
          </div>

          <div className="delivery-info">
            <div className="delivery-item">
              <span className="delivery-icon">🚚</span>
              <span>Доставка по всей России</span>
            </div>
            <div className="delivery-item">
              <span className="delivery-icon">📦</span>
              <span>Бесплатная доставка от 2000₽</span>
            </div>
            <div className="delivery-item">
              <span className="delivery-icon">🔄</span>
              <span>Возврат в течение 14 дней</span>
            </div>
          </div>
          <div className="product-detail-actions">
            <button onClick={handleAddToCart} className="add-to-cart-detail-btn">
              Добавить в корзину
            </button>
            <button onClick={handleBuyNow} className="buy-now-detail-btn">
              Купить сейчас
            </button>
          </div>
        </div>
      </div>

      {/* Вкладки с описанием и характеристиками */}
      <div className="product-detail-tabs">
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Описание
          </button>
          <button 
            className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            Характеристики
          </button>
        </div>
        <div className="tabs-content">
          {activeTab === 'description' && (
            <div className="description-content">
              <p>{product.description || 'Описание товара отсутствует.'}</p>
            </div>
          )}
          {activeTab === 'specs' && (
            <div className="specs-content">
              <table className="specs-table">
                <tbody>
                  <tr>
                    <td className="spec-label">Наименование:</td>
                    <td className="spec-value">{product.name}</td>
                  </tr>
                  <tr>
                    <td className="spec-label">Стоимость:</td>
                    <td className="spec-value">{formatPrice(product.price)}</td>
                  </tr>
                  <tr>
                    <td className="spec-label">Категория:</td>
                    <td className="spec-value">{getProductCategory(product.name)}</td>
                  </tr>
                  <tr>
                    <td className="spec-label">Артикул:</td>
                    <td className="spec-value">SF-{String(product.id).padStart(5, '0')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Похожие товары */}
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2 className="related-title">Похожие товары</h2>
          <div className="related-products-grid">
            {relatedProducts.map(relatedProduct => (
              <div 
                key={relatedProduct.id} 
                className="related-product-card"
                onClick={() => handleRelatedProductClick(relatedProduct.id)}
              >
                <ProductImage 
                  src={relatedProduct.imageUrl} 
                  alt={relatedProduct.name} 
                  className="related-product-image" 
                  placeholder={NO_IMAGE_URL}
                />
                <h3 className="related-product-title">{relatedProduct.name}</h3>
                <p className="related-product-price">{formatPrice(relatedProduct.price)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;