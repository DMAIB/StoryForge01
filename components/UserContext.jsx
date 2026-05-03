import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // При загрузке приложения проверяем localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsLoggedIn(true);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(userData)); // Сохраняем
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user'); // Очищаем
  };

  // Новая функция для обновления данных пользователя
  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider value={{ user, isLoggedIn, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};