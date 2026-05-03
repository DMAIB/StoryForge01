import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Header.css';

const Header = () => {
  const { user, isLoggedIn, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Определяем, какие ссылки показывать в зависимости от роли
  const getNavLinks = () => {
    const links = [];
        
    if (!isLoggedIn) {
      // Неавторизованные
      links.push(<Link key="register" to="/register">Register</Link>);
      links.push(<Link key="login" to="/login">Login</Link>);
      links.push(<Link key="products" to="/products">Products</Link>);
      links.push(<Link key="cart" to="/cart">Cart</Link>);
    } else if (user?.role === 'admin') {
      // Только админ
      links.push(<Link key="products" to="/products">Products</Link>);
      links.push(<Link key="admin-orders" to="/admin/orders" className="admin-link">Orders</Link>);
      links.push(<Link key="admin" to="/admin" className="admin-link">Admin Panel</Link>);
    } else if (user?.role === 'user') {
      // Обычный пользователь
      links.push(<Link key="profile" to="/profile">Profile</Link>);
      links.push(<Link key="products" to="/products">Products</Link>);
      links.push(<Link key="my-orders" to="/my-orders">My Stories</Link>);
      links.push(<Link key="cart" to="/cart">Cart</Link>);
    }
    
    return links;
  };

  return (
    <header>
      <h1><a href="/products">StoryForge</a></h1>
      <nav>
        {getNavLinks()}
        
        {isLoggedIn && (
          <>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;