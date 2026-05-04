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
  const [selectedCategory, setSelectedCategory] = useState('Все товары');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [notification, setNotification] = useState({ show: false, productName: '', quantity: 0 });

  const NO_IMAGE_URL = '/images/no-image.png';

  

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuantityChange = (productId, value) => {
    const newQuantity = parseInt(value) || 1;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantities(prev => ({ ...prev, [productId]: newQuantity }));
    }
  };

  const handleAddToCart = (product, event) => {
    event.stopPropagation();
    const quantity = quantities[product.id] || 1;
    addToCart(product, quantity);
    setNotification({ show: true, productName: product.name, quantity: quantity });
    setTimeout(() => {
      setNotification({ show: false, productName: '', quantity: 0 });
    }, 2000);
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Функция возвращает МАССИВ категорий для товара
const getCategoriesFromName = (name) => {
  const nameLower = name.toLowerCase();
  const categories = new Set();

  // Проверка на профессиональное творчество (должна быть первой)
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

// Проверка на кастом и редкости (должна быть второй)
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
  
  // 6. Детское творчество (с пометками безопасности)
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
  
  // Если категорий не найдено
  if (categories.size === 0) {
    categories.add('Другое');
  }
  
  return Array.from(categories);
};
  // Добавляем массив категорий к каждому товару
  const productsWithCategories = products.map(product => ({
    ...product,
    categories: product.categories || getCategoriesFromName(product.name)
  }));

  // Получаем уникальные категории и сортируем
  const getSortedCategories = () => {
    const allCategories = new Set();
    
    productsWithCategories.forEach(product => {
      if (product.categories && Array.isArray(product.categories)) {
        product.categories.forEach(cat => allCategories.add(cat));
      }
    });
    
    const uniqueCategories = Array.from(allCategories);
    
    const otherIndex = uniqueCategories.indexOf('Другое');
    let other = [];
    let otherCategories = [];
    
    if (otherIndex !== -1) {
      other = [uniqueCategories[otherIndex]];
      otherCategories = uniqueCategories.filter((_, index) => index !== otherIndex);
    } else {
      otherCategories = [...uniqueCategories];
    }
    
    otherCategories.sort((a, b) => a.localeCompare(b));
    
    return ['Все товары', ...otherCategories, ...other];
  };

  const categories = getSortedCategories();

  // Сортировка товаров
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

  // Фильтрация
  const getFilteredProducts = () => {
    let filtered = [...productsWithCategories];
    
    if (selectedCategory !== 'Все товары') {
      filtered = filtered.filter(product => 
        product.categories && product.categories.includes(selectedCategory)
      );
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
    if (category === 'Все товары') return productsWithCategories.length;
    return productsWithCategories.filter(product => 
      product.categories && product.categories.includes(category)
    ).length;
  };

  return (
    <div className="products-page">
      <h2 className="page-title">Товары от StoryForge</h2>
      
      {notification.show && (
        <div className="notification">
          <span className="notification-text">
            {notification.quantity} {notification.quantity === 1 ? 'товар' : notification.quantity < 5 ? 'товара' : 'товаров'} добавлен{notification.quantity === 1 ? '' : 'о'} в корзину!
          </span>
        </div>
      )}
      
      <div className="search-sort-bar">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Поиск товаров..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="search-clear">✕</button>
          )}
        </div>

        <div className="sort-container">
          <label>Сортировать:</label>
          <select value={sortType} onChange={(e) => setSortType(e.target.value)} className="sort-select">
            <option value="default">По умолчанию</option>
            <option value="name">По названию</option>
            <option value="price-asc">Сначала дешевле</option>
            <option value="price-desc">Сначала дороже</option>
          </select>
        </div>
      </div>

      {searchQuery && (
        <div className="search-result-info">Найдено товаров: {displayedProducts.length}</div>
      )}

      <div className="catalog-layout">
        <div className="categories-vertical-text">
          <h3 className="categories-title">Категории</h3>
          {categories.map(category => (
            <div
              key={category}
              className={`category-text-item ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              <span className="category-text-name">{category}</span>
              <span className="category-text-count">({getCategoryCount(category)})</span>
            </div>
          ))}
        </div>

        <div className="products-grid">
          <div className="info-banner">
            <div className="info-item"><span>🚚</span><span>Бесплатная доставка от 3000₽</span></div>
            <div className="info-divider"></div>
            <div className="info-item"><span>🎁</span><span>Подарок при заказе от 5000₽</span></div>
            <div className="info-divider"></div>
            <div className="info-item"><span>🔄</span><span>Возврат в течение 14 дней</span></div>
          </div>

          {displayedProducts.length > 0 ? (
            <div className="product-list2">
              {displayedProducts.map(product => (
                <div key={product.id} className="product-card" onClick={() => handleProductClick(product.id)}>
                  <ProductImage src={product.imageUrl} alt={product.name} className="product-image" placeholder={NO_IMAGE_URL} />
                  <h3 className="product-title">{product.name}</h3>
                  <div className="product-info">
                    <p className="product-price">{product.price}</p>
                    <p className="product-description">{product.description || 'Описание отсутствует'}</p>
                  </div>
                  
                  <div className="quantity-selector" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="quantity-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuantityChange(product.id, (quantities[product.id] || 1) - 1);
                      }}
                      disabled={(quantities[product.id] || 1) <= 1}
                    >-</button>
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
                    >+</button>
                  </div>
                  
                  <button onClick={(e) => handleAddToCart(product, e)} className="add-to-cart-button">
                    Добавить в корзину
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products">Товары не найдены</div>
          )}
        </div>
      </div>

      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>Наверх</button>
      )}
    </div>
  );
};

export default Products;