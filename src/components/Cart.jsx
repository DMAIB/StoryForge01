import React from 'react';
import { useCart } from './CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, clearCart, updateCartItemQuantity } = useCart();

  const handleBuy = () => {
    alert('Спасибо за покупку!');
    clearCart();
  };

  const totalPrice = cartItems.reduce((total, item) => {
    const price = parseInt(item.price.replace(' ₽', ''));
    return total + (price * item.quantity);
  }, 0);

  return (
    <div className="cart">
      <h2>Корзина</h2>
      {cartItems.length === 0 ? (
        <p className="empty-cart-message">В корзине пока пусто.</p>
      ) : (
        <div>
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p className="cart-item-description">{item.description}</p>
                <p className="cart-item-price">{item.price}</p>
                <div className="quantity-control">
                  <button onClick={() => updateCartItemQuantity(item.id, Math.max(item.quantity - 1, 1))}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
              </div>
              <button className="remove-button" onClick={() => removeFromCart(item.id)}>✕</button>
            </div>
          ))}
          <div className="total-price">
            <h3>Итого: {totalPrice} ₽</h3>
          </div>
          <button className="buy-button" onClick={handleBuy}>Оформить заказ</button>
        </div>
      )}
    </div>
  );
};

export default Cart;