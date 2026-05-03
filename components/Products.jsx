import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Products.css';
import { useCart } from './CartContext';
import ProductImage from './ProductImage';

const Products = () => {
  const navigate = useNavigate();
  const { addToCart, products } = useCart();
  const [sortType, setSortType] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [notification, setNotification] = useState({ show: false, productName: '', quantity: 0 });

  // Заглушка для фото (локальная)
  const NO_IMAGE_URL = '/images/no-image.png';

  // Отслеживаем прокрутку
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Функция прокрутки наверх
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Функция для изменения количества
  const handleQuantityChange = (productId, value) => {
    const newQuantity = parseInt(value) || 1;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantities(prev => ({ ...prev, [productId]: newQuantity }));
    }
  };

  // Функция добавления в корзину с количеством
  const handleAddToCart = (product, event) => {
    event.stopPropagation(); // Предотвращаем переход на страницу товара
    
    const quantity = quantities[product.id] || 1;
    
    addToCart(product, quantity);
    
    setNotification({ 
      show: true, 
      productName: product.name, 
      quantity: quantity 
    });
    
    setTimeout(() => {
      setNotification({ show: false, productName: '', quantity: 0 });
    }, 2000);
    
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  // Обработчик клика по карточке
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Определяем категории на основе названий товаров
  const getCategoryFromName = (name) => {
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

  // Добавляем категорию к каждому товару
  const productsWithCategories = products.map(product => ({
    ...product,
    category: product.category || getCategoryFromName(product.name)
  }));

  // Получаем уникальные категории
  const categories = ['all', ...new Set(productsWithCategories.map(product => product.category))];

  // Функция для сортировки товаров
  const getSortedProducts = (productsToSort) => {
    const productsCopy = [...productsToSort];

    switch (sortType) {
      case 'name':
        return productsCopy.sort((a, b) => a.name.localeCompare(b.name));
      case 'price-asc':
        return productsCopy.sort((a, b) => {
          const priceA = parseFloat(a.price.replace(/[^0-9.-]+/g, ''));
          const priceB = parseFloat(b.price.replace(/[^0-9.-]+/g, ''));
          return priceA - priceB;
        });
      case 'price-desc':
        return productsCopy.sort((a, b) => {
          const priceA = parseFloat(a.price.replace(/[^0-9.-]+/g, ''));
          const priceB = parseFloat(b.price.replace(/[^0-9.-]+/g, ''));
          return priceB - priceA;
        });
      default:
        return productsCopy;
    }
  };

  // Фильтрация по категории и поиску
  const getFilteredProducts = () => {
    let filtered = [...productsWithCategories];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  const displayedProducts = getSortedProducts(filteredProducts);

  const getCategoryCount = (category) => {
    if (category === 'all') return productsWithCategories.length;
    return productsWithCategories.filter(product => product.category === category).length;
  };

  return (
    <div>
      <h2 className="page-title">Товары от StoryForge</h2>
      
      {/* Уведомление */}
      {notification.show && (
        <div className="notification">
          <span className="notification-text">
            {notification.quantity} {notification.quantity === 1 ? 'товар' : notification.quantity < 5 ? 'товара' : 'товаров'} добавлен{notification.quantity === 1 ? '' : 'о'} в корзину!
          </span>
        </div>
      )}
      
      {/* Строка поиска и сортировки */}
      <div className="search-sort-bar">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="🔍 Поиск товаров..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="search-clear">
              ✕
            </button>
          )}
        </div>

        <div className="sort-container">
          <label>Сортировать:</label>
          <select 
            value={sortType} 
            onChange={(e) => setSortType(e.target.value)}
            className="sort-select"
          >
            <option value="default">По умолчанию</option>
            <option value="name">По названию</option>
            <option value="price-asc">Сначала дешевле</option>
            <option value="price-desc">Сначала дороже</option>
          </select>
        </div>
      </div>

      {searchQuery && (
        <div className="search-result-info">
          Найдено товаров: {displayedProducts.length}
        </div>
      )}

      {/* Основной контент */}
      <div className="catalog-layout">
        {/* Категории */}
        <div className="categories-vertical-text">
          <h3 className="categories-title">Категории</h3>
          {categories.map(category => (
            <div
              key={category}
              className={`category-text-item ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              <span className="category-text-name">
                {category === 'all' ? 'Все товары' : category}
              </span>
              <span className="category-text-count">({getCategoryCount(category)})</span>
            </div>
          ))}
        </div>

        {/* Товары */}
        <div className="products-grid">
          {/* Баннер */}
          <div className="info-banner">
            <div className="info-item">
              <span>🚚</span>
              <span>Бесплатная доставка от 2000₽</span>
            </div>
            <div className="info-divider"></div>
            <div className="info-item">
              <span>🎁</span>
              <span>Подарок при заказе от 3000₽</span>
            </div>
            <div className="info-divider"></div>
            <div className="info-item">
              <span>🔄</span>
              <span>Возврат в течение 14 дней</span>
            </div>
          </div>

          {displayedProducts.length > 0 ? (
            <div className="product-list2">
              {displayedProducts.map(product => (
                <div 
                  key={product.id} 
                  className="product-card"
                  onClick={() => handleProductClick(product.id)}
                >
                  <ProductImage 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="product-image" 
                    placeholder={NO_IMAGE_URL}
                  />
                  <h3 className="product-title">{product.name}</h3>
                  <div className="product-info">
                    <p className="product-price">{product.price}</p>
                    <p className="product-description">{product.description || 'Описание отсутствует'}</p>
                  </div>
                  
                  {/* Выбор количества */}
                  <div className="quantity-selector" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="quantity-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuantityChange(product.id, (quantities[product.id] || 1) - 1);
                      }}
                      disabled={(quantities[product.id] || 1) <= 1}
                    >
                      -
                    </button>
                    <input
                      type="text"
                      className="quantity-input"
                      value={quantities[product.id] || 1}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 99)) {
                          handleQuantityChange(product.id, value || 1);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button 
                      className="quantity-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuantityChange(product.id, (quantities[product.id] || 1) + 1);
                      }}
                      disabled={(quantities[product.id] || 1) >= 99}
                    >
                      +
                    </button>
                  </div>
                  
                  <button 
                    onClick={(e) => handleAddToCart(product, e)} 
                    className="add-to-cart-button"
                  >
                    Добавить в корзину
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products">
              😕 Товары не найдены
            </div>
          )}
        </div>
      </div>

      {/* Кнопка "Наверх" */}
      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
        Наверх
        </button>
      )}
    </div>
  );
};

export default Products;