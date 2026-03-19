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
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Пароли не совпадают!');
      return;
    }

    try {
      const response = await axios.post('http://localhost/StoryForge/api/register.php', {
        name,
        email,
        phone,
        password,
    });     

      if (response.data.success) {
        const { user } = response.data;
        login(user);
        navigate('/products');
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      setErrorMessage('Не удалось зарегистрироваться. Попробуйте еще раз.');
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
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Телефон</label>
            <input 
              type="text" 
              id="phone"
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
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
              required 
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
            />
          </div>
          <button type="submit" className="register-button">Зарегистрироваться</button>
          {errorMessage && <p>{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default Register;