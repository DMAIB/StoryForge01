import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Login.css';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost/StoryForge/api/login.php', {
        email,
        password,
      });

      console.log('Ответ сервера:', response.data);

      if (response.data.success) {
        const { user } = response.data;
        console.log('Роль пользователя:', user.role);
        
        login(user); // Сохраняем в контекст и localStorage
        
        // Перенаправляем по роли
        if (user.role === 'admin') {
          navigate('/admin/orders');
        } else {
          navigate('/products');
        }
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      setErrorMessage('Произошла ошибка. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-background">
      <div className="login-container">
        <h2>Вход</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Электронная почта</label>
            <input 
              type="email"
              id="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder='example@mail.com'
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input 
              type="password" 
              id="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder='Минимум 6 символов'
              required 
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Загрузка...' : 'Войти'}
          </button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <p>Нет аккаунта? <a href="/register">Зарегистрироваться</a></p>
        </form>
      </div>
    </div>
  );
};

export default Login;