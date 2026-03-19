import React, { useState } from 'react';
import { useCart } from './CartContext';
import './AdminPanel.css';

const AdminPanel = () => {
  const { addProduct, products, removeProduct, updateProduct } = useCart();
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.imageUrl) {
      alert("Пожалуйста, заполните все поля.");
      return;
    }

    if (isEditing) {
      await updateProduct({ ...newProduct, id: editingId });
      setIsEditing(false);
      setEditingId(null);
    } else {
      await addProduct(newProduct);
    }

    setNewProduct({ name: '', price: '', description: '', imageUrl: '' });
  };

  const handleEdit = (product) => {
    setNewProduct({
      name: product.name,
      price: product.price,
      description: product.description || '',
      imageUrl: product.imageUrl
    });
    setIsEditing(true);
    setEditingId(product.id);
  };

  return (
    <div className="admin-panel-container">
      <div className="admin-panel">
        <h2>{isEditing ? 'Редактировать продукт' : 'Добавить новый продукт'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Название"
            value={newProduct.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="price"
            placeholder="Цена (например: 700 ₽)"
            value={newProduct.price}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Описание"
            value={newProduct.description}
            onChange={handleChange}
          />
          <input
            type="text"
            name="imageUrl"
            placeholder="URL изображения"
            value={newProduct.imageUrl}
            onChange={handleChange}
            required
          />
          <button type="submit">{isEditing ? 'Сохранить изменения' : 'Добавить продукт'}</button>
        </form>
      </div>

      <div className="product-list-container">
        <h2>Список продуктов</h2>
        <div className="product-list">
          {products.map(product => (
            <div key={product.id} className="product-card2">
              <img src={product.imageUrl} alt={product.name} className="product-image" />
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-price">{product.price}</p>
                <p className="product-description">{product.description}</p>
                <button className="add-to-cart-button2" onClick={() => handleEdit(product)}>Редактировать</button>
                <button className="add-to-cart-button2" onClick={() => removeProduct(product.id)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;