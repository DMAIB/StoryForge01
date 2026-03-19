import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Header.css';

const Header = () => {
  const { user, isLoggedIn, logout } = useContext(UserContext);

  return (
    <header>
      <h1>StoryForge</h1>
      <nav>
        <Link to="/">Home</Link>
        
        {!isLoggedIn && (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
        {isLoggedIn && (
          <>
            <Link to="/profile">Profile</Link>
            <Link to="/admin">Admin</Link>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              Logout
            </button>
          </>
        )}
        <Link to="/products">Products</Link>
        <Link to="/cart">Cart</Link>
      </nav>
    </header>
  );
};

export default Header;