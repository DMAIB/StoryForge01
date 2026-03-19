import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './components/UserContext';
import { CartProvider } from './components/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Products from './components/Products';
import Profile from './components/Profile';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/products" element={<Products />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<h1>404 - Page Not Found</h1>} />
          </Routes>
          <Footer />
        </Router>
      </CartProvider>
    </UserProvider>
  );
}

export default App;