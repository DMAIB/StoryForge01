import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Profile.css';

const Profile = () => {
  const { user, isLoggedIn, logout } = useContext(UserContext);
  const navigate = useNavigate();

  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img
          className="profile-picture"
          src="https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"
          alt="Профиль пользователя"
        />
        <h1 className="profile-name">{user?.name}</h1>
        <p className="profile-email">Email: {user?.email}</p>
        <p className="profile-phone">Телефон: {user?.phone}</p>
      </div>
      <button className="edit-button" onClick={logout}>
        Выйти
      </button>
    </div>
  );
};

export default Profile;