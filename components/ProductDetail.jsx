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

  const NO_IMAGE_URL = '/images/no-image.png';

  // КОПИРУЕМ ФУНКЦИЮ getCategoriesFromName ИЗ Products.js
  const getCategoriesFromName = (name) => {
    const nameLower = name.toLowerCase();
    const categories = new Set();

    // Проверка на профессиональное творчество
    if (name.includes('КАТЕГОРИЯ: ПРОФЕССИОНАЛЬНОЕ ТВОРЧЕСТВО') ||
        nameLower.includes('professional') ||
        nameLower.includes('artist pro') ||
        nameLower.includes('old holland') ||
        nameLower.includes('daniel smith') ||
        nameLower.includes('schmincke') ||
        nameLower.includes('winsor & newton') ||
        nameLower.includes('raphael') ||
        nameLower.includes('da vinci') ||
        nameLower.includes('arches') ||
        nameLower.includes('canson infinity') ||
        nameLower.includes('stillman & birn') ||
        nameLower.includes('mabef') ||
        nameLower.includes('copic sketch') ||
        nameLower.includes('pigma micron') ||
        nameLower.includes('rotring isograph') ||
        nameLower.includes('liquitex') ||
        nameLower.includes('faber-castell polychromos') ||
        nameLower.includes('гамма studio professional')) {
      categories.add('Профессиональное творчество');
    }

    // Проверка на кастом и редкости
    if (name.includes('КАТЕГОРИЯ: КАСТОМ И РЕДКОСТИ') ||
        nameLower.includes('кастом') ||
        nameLower.includes('collab') ||
        nameLower.includes('лимит') ||
        nameLower.includes('limited') ||
        nameLower.includes('редкость') ||
        nameLower.includes('vintage') ||
        nameLower.includes('винтаж') ||
        nameLower.includes('эксклюзив') ||
        nameLower.includes('дизайн') ||
        nameLower.includes('handmade') ||
        nameLower.includes('архив') ||
        nameLower.includes('montblanc') ||
        nameLower.includes('waterman') ||
        nameLower.includes('pentel mechanica') ||
        nameLower.includes('blackwing') ||
        nameLower.includes('golden heavy body') ||
        nameLower.includes('saunders waterford') ||
        nameLower.includes('lukos') ||
        nameLower.includes('hightide') ||
        nameLower.includes('lamy se') ||
        nameLower.includes('tombow') ||
        nameLower.includes('moleskine keith haring') ||
        nameLower.includes('posca') ||
        nameLower.includes('art secret') ||
        nameLower.includes('marc jacobs') ||
        nameLower.includes('nevskaya palitra hermitage') ||
        nameLower.includes('riefler')) {
      categories.add('Кастом и редкости');
    }
    
    // 1. Бумажная продукция
    if (nameLower.includes('тетрад') || 
        nameLower.includes('блокнот') || 
        nameLower.includes('скетчбук') || 
        nameLower.includes('альбом') ||
        nameLower.includes('бумага') ||
        nameLower.includes('картон') ||
        nameLower.includes('стикеры') ||
        nameLower.includes('раскрасок') ||
        nameLower.includes('дневник')) {
      categories.add('Бумажная продукция');
    }
    
    // 2. Письменные принадлежности
    if (nameLower.includes('ручка') || 
        nameLower.includes('карандаш') ||
        nameLower.includes('клей') ||
        nameLower.includes('ножницы') ||
        nameLower.includes('ластик') ||
        nameLower.includes('точилка') ||
        nameLower.includes('маркер') ||
        nameLower.includes('фломастер') ||
        nameLower.includes('линер') ||
        nameLower.includes('корректор') ||
        nameLower.includes('линейка') ||
        nameLower.includes('пенал') ||
        nameLower.includes('ластик-клячка') ||
        nameLower.includes('угольных')) {
      categories.add('Письменные принадлежности');
    }
    
    // 3. Рисование и живопись
    if (nameLower.includes('краски') || 
        nameLower.includes('акрил') || 
        nameLower.includes('акварель') || 
        nameLower.includes('гуашь') || 
        nameLower.includes('масляные') ||
        nameLower.includes('пастель') ||
        nameLower.includes('мелки') ||
        nameLower.includes('палитра') ||
        nameLower.includes('аквагрим') ||
        nameLower.includes('песок для рисования')) {
      categories.add('Рисование и живопись');
    }
    
    // 4. Кисти и инструменты
    if (nameLower.includes('кисти') || 
        nameLower.includes('холст') ||
        nameLower.includes('мольберт') ||
        nameLower.includes('планшет для рисования') ||
        nameLower.includes('щетина')) {
      categories.add('Кисти и инструменты');
    }
    
    // 5. Лепка и творчество
    if (nameLower.includes('лепка') || 
        nameLower.includes('глина') || 
        nameLower.includes('пластилин') ||
        nameLower.includes('тесто') ||
        nameLower.includes('стек') ||
        nameLower.includes('кинетический песок') ||
        nameLower.includes('восковой')) {
      categories.add('Лепка и творчество');
    }
    
    // 6. Детское творчество
    if (nameLower.includes('пальчиков') || 
        nameLower.includes('нетоксич') || 
        nameLower.includes('гипоаллерген') ||
        nameLower.includes('моющиеся') ||
        nameLower.includes('малыш') ||
        nameLower.includes('первые шедевры') ||
        nameLower.includes('детские ножницы') ||
        (nameLower.includes('детский') && nameLower.includes('пластилин')) ||
        (nameLower.includes('штамп') && nameLower.includes('животные')) ||
        (nameLower.includes('штамп') && nameLower.includes('алфавит')) ||
        (nameLower.includes('раскрасок')) ||
        nameLower.includes('для детей') ||
        nameLower.includes('аквагрим') ||
        nameLower.includes('кинетический песок') ||
        nameLower.includes('мыловарения') ||
        nameLower.includes('двухсторонние фломастеры') ||
        nameLower.includes('лучик')) {
      categories.add('Детское творчество');
    }
    
    // 7. Офисные товары
    if (nameLower.includes('офис') ||
        nameLower.includes('степлер') ||
        nameLower.includes('картридж') ||
        nameLower.includes('салфетки') ||
        nameLower.includes('регистратор') ||
        nameLower.includes('скоросшиватель') ||
        nameLower.includes('дырокол') ||
        nameLower.includes('скобы')) {
      categories.add('Офисные товары');
    }
    
    // 8. Для студентов и школьников
    if (nameLower.includes('тетрад') || 
        nameLower.includes('ручка') || 
        nameLower.includes('карандаш') ||
        nameLower.includes('ластик') ||
        nameLower.includes('точилка') ||
        nameLower.includes('линейка') ||
        nameLower.includes('дневник') ||
        nameLower.includes('пенал') ||
        nameLower.includes('набор "студент') ||
        nameLower.includes('набор "сессия') ||
        nameLower.includes('набор "экзамен')) {
      categories.add('Для студентов и школьников');
    }
    
    // 9. Каллиграфия
    if (nameLower.includes('каллиграфия') ||
        nameLower.includes('перьевая') ||
        nameLower.includes('каллиграф') ||
        nameLower.includes('тушь')) {
      categories.add('Каллиграфия');
    }
    
    // 10. Скрапбукинг и декор
    if (nameLower.includes('скрапбукинг') ||
        nameLower.includes('вырубка') ||
        nameLower.includes('штамп') ||
        nameLower.includes('трафарет') ||
        nameLower.includes('блёстки') ||
        nameLower.includes('поталь') ||
        nameLower.includes('лента') ||
        nameLower.includes('кружево') ||
        nameLower.includes('брадс') ||
        nameLower.includes('пуговиц')) {
      categories.add('Скрапбукинг и декор');
    }
    
    // 11. Эпоксидная смола
    if (nameLower.includes('смола') || 
        nameLower.includes('пигмент') ||
        nameLower.includes('эпоксид') ||
        nameLower.includes('дотс') ||
        nameLower.includes('глиттер') ||
        nameLower.includes('сухоцветы')) {
      categories.add('Эпоксидная смола');
    }
    
    // 12. Готовые наборы
    if (nameLower.includes('набор') && 
        (nameLower.includes('студент') || 
         nameLower.includes('сессия') ||
         nameLower.includes('экзамен') ||
         nameLower.includes('старт') ||
         nameLower.includes('подарок') ||
         nameLower.includes('творчества') ||
         nameLower.includes('аппликация') ||
         nameLower.includes('животные') ||
         nameLower.includes('мыловарения') ||
         nameLower.includes('юный химик') ||
         nameLower.includes('штампов') ||
         nameLower.includes('алфавит'))) {
      categories.add('Готовые наборы');
    }
    
    // 13. Папки и файлы
    if (nameLower.includes('папка') || 
        nameLower.includes('файл') ||
        nameLower.includes('конверт') ||
        nameLower.includes('-вкладыш') ||
        nameLower.includes('скоросшиватель') ||
        nameLower.includes('регистратор')) {
      categories.add('Папки и файлы');
    }
    
    if (categories.size === 0) {
      categories.add('Другое');
    }
    
    return Array.from(categories);
  };

  // Функция для правильного склонения
  const getDeclension = (number, forms) => {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
  };

  const getNotificationText = (quantity) => {
    const qty = Number(quantity);
    const productWord = getDeclension(qty, ['товар', 'товара', 'товаров']);
    const addedWord = qty === 1 ? 'добавлен' : 'добавлено';
    return `${qty} ${productWord} ${addedWord} в корзину!`;
  };

  // НОВАЯ ФУНКЦИЯ: Умный поиск похожих товаров
  const findRelatedProducts = (currentProduct, allProducts) => {
    if (!currentProduct) return [];
    
    // Получаем категории текущего товара
    const currentCategories = getCategoriesFromName(currentProduct.name);
    
    // Вычисляем рейтинг для каждого товара
    const productsWithScore = allProducts
      .filter(p => p.id !== currentProduct.id)
      .map(product => {
        let score = 0;
        const productCategories = getCategoriesFromName(product.name);
        
        // Считаем совпадающие категории (каждая категория = +10 баллов)
        const matchingCategories = currentCategories.filter(cat => 
          productCategories.includes(cat)
        );
        score += matchingCategories.length * 10;
        
        // Дополнительный бонус за специальные категории
        if (matchingCategories.includes('Профессиональное творчество')) score += 5;
        if (matchingCategories.includes('Кастом и редкости')) score += 5;
        if (matchingCategories.includes('Готовые наборы')) score += 3;
        
        // Бонус за похожие бренды/ключевые слова
        const currentWords = currentProduct.name.toLowerCase().split(/[\s,()\-]+/);
        const productWords = product.name.toLowerCase().split(/[\s,()\-]+/);
        const commonWords = currentWords.filter(word => 
          word.length > 3 && productWords.includes(word) && 
          !['для', 'набор', 'набора', 'наборов'].includes(word)
        );
        score += commonWords.length * 2;
        
        // Небольшой бонус за похожую цену (в пределах 30%)
        const currentPrice = parseFloat(String(currentProduct.price).replace(/[^0-9.-]+/g, '')) || 0;
        const productPrice = parseFloat(String(product.price).replace(/[^0-9.-]+/g, '')) || 0;
        if (currentPrice > 0 && productPrice > 0) {
          const priceDiff = Math.abs(currentPrice - productPrice) / currentPrice;
          if (priceDiff < 0.3) score += 3;
        }
        
        return { product, score };
      });
    
    // Сортируем по убыванию рейтинга и берём топ-6
    return productsWithScore
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => item.product);
  };

  // СБРОС КОЛИЧЕСТВА ПРИ СМЕНЕ ТОВАРА
  useEffect(() => {
    setQuantity(1);
  }, [id]);

  // Загрузка данных о товаре и похожих товарах
  useEffect(() => {
    if (products.length > 0) {
      const foundProduct = products.find(p => p.id === parseInt(id));
      if (foundProduct) {
        setProduct(foundProduct);
        // Используем умный поиск похожих товаров
        const related = findRelatedProducts(foundProduct, products);
        setRelatedProducts(related);
      } else {
        setProduct(null);
      }
      setLoading(false);
    }
  }, [id, products]);

  // Для обратной совместимости (если где-то используется getProductCategory)
  const getProductCategory = (name) => {
    const categories = getCategoriesFromName(name);
    return categories[0] || 'Другое';
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

  const handleBuyNow = async () => {
    await addToCart(product, quantity);
    localStorage.setItem('buyNowProductId', product.id);
    navigate('/cart');
    setQuantity(1);
  };
  
  const handleRelatedProductClick = (productId) => {
    navigate(`/product/${productId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price) => {
    if (typeof price === 'string') {
      return price;
    }
    return `${price} ₽`;
  };

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
  const productCategories = getCategoriesFromName(product.name);

  return (
    <div className="product-detail-container">
      {notification.show && (
        <div className="detail-notification">
          <span className="notification-text">
            {getNotificationText(notification.quantity)}
          </span>
        </div>
      )}

      <div className="breadcrumbs">
        <span onClick={() => navigate('/products')}>Главная</span>
        <span className="separator">/</span>
        <span onClick={() => navigate('/products')}>Каталог</span>
        <span className="separator">/</span>
        <span className="current">{product.name}</span>
      </div>

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
            <span className="category-label">Категории:</span>
            <div className="category-tags">
              {productCategories.map((cat, idx) => (
                <span key={idx} className="category-tag">{cat}</span>
              ))}
            </div>
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
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Отзывы
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
                    <td className="spec-label">Категории:</td>
                    <td className="spec-value">
                      {productCategories.join(', ')}
                    </td>
                  </tr>
                  <tr>
                    <td className="spec-label">Артикул:</td>
                    <td className="spec-value">SF-{String(product.id).padStart(5, '0')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="reviews-content">
              <div className="no-reviews-message">
                <div className="no-reviews-icon">💬</div>
                <h3>Отзывов пока нет</h3>
                <p>Будьте первым, кто оставит отзыв о этом товаре!</p>
                <button className="write-review-btn" onClick={() => alert('Функция добавления отзывов будет доступна в ближайшее время!')}>
                  Написать отзыв
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Похожие товары - теперь умные! */}
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2 className="related-title">Похожие товары</h2>
          <div className="related-products-grid">
            {relatedProducts.map(relatedProduct => {
              const relatedCategories = getCategoriesFromName(relatedProduct.name);
              return (
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;