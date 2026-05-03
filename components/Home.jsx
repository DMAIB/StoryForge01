import React from 'react';
import './Home.css'; // Добавьте свой стиль для фона

const Home = () => {
  return (
    <div className="home">
      <h1>STORYFORGE</h1>
      <p>Творите свою историю с нами!</p>
      <a href="/products" className="button">Посмотреть товары</a>
    </div>
  );
};

export default Home;
