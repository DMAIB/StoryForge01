import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Profile.css';

const Profile = () => {
  const { user, isLoggedIn, logout, updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [editedUser, setEditedUser] = useState({
    id: user?.id || null,
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    photo: user?.photo || null
  });
  
  const [photoPreview, setPhotoPreview] = useState(user?.photo || null);

  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка размера (макс 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Файл слишком большой. Максимум 2MB');
        return;
      }
      
      // Проверка типа
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Пожалуйста, выберите изображение');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result;
        setPhotoPreview(photoData);
        setEditedUser(prev => ({ ...prev, photo: photoData }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('http://localhost/storyforge/api/update_profile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: editedUser.id,
          name: editedUser.name,
          email: editedUser.email,
          phone: editedUser.phone,
          address: editedUser.address,
          photo: editedUser.photo
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        updateUser(data.user);
        setIsEditing(false);
        setSuccessMessage('Профиль успешно обновлен!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(data.message || 'Ошибка при сохранении');
      }
    } catch (error) {
      setErrorMessage('Ошибка соединения с сервером');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedUser({
      id: user?.id || null,
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      photo: user?.photo || null
    });
    setPhotoPreview(user?.photo || null);
    setIsEditing(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setEditedUser(prev => ({ ...prev, photo: null }));
  };

  const defaultAvatar = "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="photo-section">
          <img
            className="profile-picture"
            src={photoPreview || defaultAvatar}
            alt="Профиль"
          />
          {isEditing && (
            <div className="photo-edit-buttons">
              <label className="photo-upload-label">
              Загрузить фото
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </label>
              {(photoPreview || user?.photo) && (
                <button className="photo-remove-btn" onClick={handleRemovePhoto}>
                Удалить
                </button>
              )}
            </div>
          )}
        </div>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {isEditing ? (
          <div className="edit-form">
            <div className="form-group">
              <label>Имя:</label>
              <input
                type="text"
                name="name"
                value={editedUser.name}
                onChange={handleInputChange}
                placeholder="Введите имя"
              />
            </div>
            
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={editedUser.email}
                onChange={handleInputChange}
                placeholder="Введите email"
              />
            </div>
            
            <div className="form-group">
              <label>Телефон:</label>
              <input
                type="tel"
                name="phone"
                value={editedUser.phone}
                onChange={handleInputChange}
                placeholder="Введите телефон"
              />
            </div>
            
            <div className="form-group">
              <label>Адрес доставки:</label>
              <textarea
                name="address"
                value={editedUser.address || ''}
                onChange={handleInputChange}
                placeholder="Введите ваш адрес (улица, дом, квартира, город)"
                rows="4"
                className="address-input"
              />
            </div>
            
            <div className="edit-buttons">
              <button 
                className="save-button" 
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button className="cancel-button" onClick={handleCancel}>
              Отмена
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="profile-name">{user?.name || 'Не указано'}</h1>
            <div className="profile-info">
              <p className="profile-email">
                <strong>📧 Email:</strong> {user?.email || 'Не указан'}
              </p>
              <p className="profile-phone">
                <strong>📱 Телефон:</strong> {user?.phone || 'Не указан'}
              </p>
              <p className="profile-address">
                <strong>📍 Адрес доставки:</strong> 
                {user?.address ? (
                  <span className="address-text">{user.address}</span>
                ) : (
                  <span className="no-address"> Не указан</span>
                )}
              </p>
            </div>
            
            <div className="action-buttons">
              <button className="edit-button" onClick={() => setIsEditing(true)}>
              Редактировать профиль
              </button>
              <button className="logout-button" onClick={logout}>
              Выйти
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;