import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Register.css';
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  // Валидация email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Валидация телефона (простейшая, можно расширить)
  const validatePhone = (phone) => {
    const re = /^[\d\+][\d\(\)\ -]{4,14}\d$/;
    return re.test(phone);
  };

  // Валидация пароля (минимум 6 символов)
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    // Проверка имени
    if (!name.trim()) {
      setErrorMessage('Введите имя');
      setLoading(false);
      return;
    }

    if (name.length < 2) {
      setErrorMessage('Имя должно содержать минимум 2 символа');
      setLoading(false);
      return;
    }

    // Проверка email
    if (!email.trim()) {
      setErrorMessage('Введите email');
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Введите корректный email (пример: user@example.com)');
      setLoading(false);
      return;
    }

    // Проверка телефона
    if (!phone.trim()) {
      setErrorMessage('Введите номер телефона');
      setLoading(false);
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMessage('Введите корректный номер телефона (пример: +79991234567 или 89123456789)');
      setLoading(false);
      return;
    }

    // Проверка пароля
    if (!password) {
      setErrorMessage('Введите пароль');
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage('Пароль должен содержать не менее 6 символов');
      setLoading(false);
      return;
    }

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      setErrorMessage('Пароли не совпадают!');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost/StoryForge/api/register.php', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });     

      if (response.data.success) {
        const { user } = response.data;
        login(user); // Автоматически логиним пользователя
        
        // Перенаправляем в зависимости от роли
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/products');
        }
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      if (error.response) {
        setErrorMessage(error.response.data.message || 'Ошибка сервера. Попробуйте позже.');
      } else if (error.request) {
        setErrorMessage('Нет соединения с сервером. Проверьте подключение.');
      } else {
        setErrorMessage('Не удалось зарегистрироваться. Попробуйте еще раз.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-background">
      <div className="register-container">
        <h2>Регистрация</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Имя</label>
            <input 
              type="text" 
              id="name"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              placeholder="Введите ваше имя"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Электронная почта</label>
            <input 
              type="email"
              id="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="example@mail.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Телефон</label>
            <input 
              type="tel" 
              id="phone"
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              required 
              placeholder="+79991234567"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input 
              type="password" 
              id="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Минимум 6 символов"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Подтвердите пароль</label>
            <input 
              type="password" 
              id="confirm-password"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              placeholder="Введите пароль еще раз"
              disabled={loading}
            />
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
          
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          
          <p className="login-link">
            Уже зарегистрированы? <a href="/login">Войти</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;