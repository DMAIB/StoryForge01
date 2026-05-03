import React, { useState, useContext, useRef, useEffect } from 'react';
import { useCart } from './CartContext';
import { UserContext } from './UserContext';
import ProductImage from './ProductImage';
import './AdminPanel.css';

// Компонент модального окна для редактирования
const ProductEditModal = ({ product, isOpen, onClose, onSave }) => {
  const [editedProduct, setEditedProduct] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: ''
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const NO_IMAGE_URL = '/images/no-image.png';

  useEffect(() => {
    if (product) {
      setEditedProduct({
        name: product.name,
        price: product.price.replace(' ₽', ''),
        description: product.description || '',
        imageUrl: product.imageUrl
      });
    }
  }, [product]);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Ошибка при загрузке:', error);
      alert('Не удалось загрузить изображение');
      return null;
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Изображение не должно превышать 5MB');
      return;
    }

    setUploading(true);
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setEditedProduct({ ...editedProduct, imageUrl });
    }
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({
      ...editedProduct,
      [name]: value
    });
  };

  const handlePriceChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    if (value) {
      value = parseInt(value).toString();
    }
    setEditedProduct({ ...editedProduct, price: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editedProduct.name || !editedProduct.price || !editedProduct.imageUrl) {
      alert("Пожалуйста, заполните все поля и добавьте изображение.");
      return;
    }

    await onSave({ 
      ...editedProduct, 
      id: product.id,
      price: `${editedProduct.price} ₽`
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Редактировать товар</h3>
          <button className="admin-modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Название"
            value={editedProduct.name}
            onChange={handleChange}
            required
          />
          
          <div className="admin-price-input-wrapper">
            <input
              type="text"
              name="price"
              placeholder="Цена"
              value={editedProduct.price}
              onChange={handlePriceChange}
              required
            />
            <span className="admin-price-currency">₽</span>
          </div>
          
          <textarea
            name="description"
            placeholder="Описание"
            value={editedProduct.description}
            onChange={handleChange}
            rows="4"
          />
          
          <div className="admin-modal-image-upload">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="admin-edit-image-upload"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="admin-modal-upload-btn"
              disabled={uploading}
            >
              {uploading ? 'Загрузка...' : 'Выбрать изображение'}
            </button>
            
            {editedProduct.imageUrl && (
              <div className="admin-modal-image-preview">
                <img 
                  src={editedProduct.imageUrl} 
                  alt="Preview" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = NO_IMAGE_URL;
                  }}
                />
                <button
                  type="button"
                  onClick={() => setEditedProduct({ ...editedProduct, imageUrl: '' })}
                  className="admin-modal-remove-img"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          
          <input
            type="text"
            name="imageUrl"
            placeholder="Или URL изображения"
            value={editedProduct.imageUrl}
            onChange={handleChange}
          />
          
          <div className="admin-modal-buttons">
            <button type="submit" disabled={uploading}>
              Сохранить
            </button>
            <button type="button" onClick={onClose} className="admin-modal-cancel">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Основной компонент AdminPanel
const AdminPanel = () => {
  const { user } = useContext(UserContext);
  const { addProduct, products, removeProduct, updateProduct } = useCart();
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: ''
  });
  const [uploading, setUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  
  const [adminSortType, setAdminSortType] = useState('default');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const NO_IMAGE_URL = '/images/no-image.png';

  // useEffect для отслеживания прокрутки
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

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-panel-container">
        <div className="access-denied">
          <h2>Доступ запрещен</h2>
          <p>У вас нет прав для просмотра этой страницы.</p>
          <a href="/products" className="back-link">Вернуться в магазин</a>
        </div>
      </div>
    );
  }

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Ошибка при загрузке:', error);
      showNotification('Не удалось загрузить изображение', 'error');
      return null;
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Пожалуйста, выберите изображение', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('Изображение не должно превышать 5MB', 'error');
      return;
    }

    setUploading(true);
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setNewProduct({
        ...newProduct,
        imageUrl: imageUrl
      });
      showNotification('Изображение загружено', 'success');
    }
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value
    });
  };

  const handlePriceChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    if (value) {
      value = parseInt(value).toString();
    }
    setNewProduct({ ...newProduct, price: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.imageUrl) {
      showNotification("Пожалуйста, заполните все поля и загрузите изображение.", 'error');
      return;
    }

    await addProduct({
      ...newProduct,
      price: `${newProduct.price} ₽`
    });
    showNotification(`Товар "${newProduct.name}" добавлен`, 'success');
    setNewProduct({ name: '', price: '', description: '', imageUrl: '' });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveEdit = async (updatedProduct) => {
    await updateProduct(updatedProduct);
    showNotification(`Товар "${updatedProduct.name}" обновлен`, 'success');
  };

  const handleDelete = (productId, productName) => {
    if (window.confirm(`Вы уверены, что хотите удалить "${productName}"?`)) {
      removeProduct(productId);
      showNotification(`Товар "${productName}" удален`, 'success');
    }
  };

  const getSortedProducts = (productsToSort) => {
    const productsCopy = [...productsToSort];

    switch (adminSortType) {
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

  const getFilteredProducts = () => {
    let filtered = [...products];
    
    if (adminSearchQuery.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(adminSearchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  const displayedProducts = getSortedProducts(filteredProducts);

  return (
    <div className="admin-panel-container">
      {notification && (
        <div className={`admin-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="admin-panel">
        <h2>Добавить новый продукт</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Название"
            value={newProduct.name}
            onChange={handleChange}
            required
          />
          
          <div className="admin-price-input-wrapper">
            <input
              type="text"
              name="price"
              placeholder="Цена"
              value={newProduct.price}
              onChange={handlePriceChange}
              required
            />
            <span className="admin-price-currency">₽</span>
          </div>
          
          <textarea
            name="description"
            placeholder="Описание"
            value={newProduct.description}
            onChange={handleChange}
            rows="4"
          />
          
          <div className="admin-image-upload-container">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="admin-upload-button"
              disabled={uploading}
            >
              {uploading ? 'Загрузка...' : 'Выбрать изображение'}
            </button>
            
            {newProduct.imageUrl && (
              <div className="admin-image-preview">
                <img 
                  src={newProduct.imageUrl} 
                  alt="Preview" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = NO_IMAGE_URL;
                  }}
                />
                <button
                  type="button"
                  onClick={() => setNewProduct({ ...newProduct, imageUrl: '' })}
                  className="admin-remove-image"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          
          <input
            type="text"
            name="imageUrl"
            placeholder="Или URL изображения"
            value={newProduct.imageUrl}
            onChange={handleChange}
          />
          
          <button type="submit" disabled={uploading}>
            Добавить продукт
          </button>
        </form>
      </div>

      <div className="admin-product-list-container">
        <h2>Список продуктов</h2>
        
        <div className="admin-search-sort-bar">
          <div className="admin-search-container">
            <input 
              type="text" 
              placeholder="Поиск по товарам..." 
              value={adminSearchQuery}
              onChange={(e) => setAdminSearchQuery(e.target.value)}
              className="admin-search-input"
            />
            {adminSearchQuery && (
              <button onClick={() => setAdminSearchQuery('')} className="admin-search-clear">
                ×
              </button>
            )}
          </div>

          <div className="admin-sort-container">
            <label>Сортировать:</label>
            <select 
              value={adminSortType} 
              onChange={(e) => setAdminSortType(e.target.value)}
              className="admin-sort-select"
            >
              <option value="default">По умолчанию</option>
              <option value="name">По названию</option>
              <option value="price-asc">Сначала дешевле</option>
              <option value="price-desc">Сначала дороже</option>
            </select>
          </div>
        </div>

        {adminSearchQuery && (
          <div className="admin-search-result-info">
            Найдено товаров: {displayedProducts.length}
          </div>
        )}
        
        <div className="admin-product-list">
          {displayedProducts.length > 0 ? (
            displayedProducts.map(product => (
              <div key={product.id} className="admin-product-card">
                <ProductImage 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="admin-product-image" 
                  placeholder={NO_IMAGE_URL}
                />
                <div className="admin-product-info">
                  <h3>{product.name}</h3>
                  <p className="admin-product-price">{product.price}</p>
                  <div className="admin-product-description-wrapper">
                    <p className="admin-product-description">{product.description || 'Нет описания'}</p>
                    {product.description && product.description.length > 80 && (
                      <span className="admin-description-toggle">...</span>
                    )}
                  </div>
                  <div className="admin-buttons">
                    <button className="admin-edit-button" onClick={() => handleEdit(product)}>
                      Редактировать
                    </button>
                    <button className="admin-delete-button" onClick={() => handleDelete(product.id, product.name)}>
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="admin-no-products">
              Товары не найдены
            </div>
          )}
        </div>
      </div>

      <ProductEditModal
        product={editingProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveEdit}
      />

      {/* Кнопка "Наверх" */}
      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
        Наверх
        </button>
      )}
    </div>
  );
};

export default AdminPanel;