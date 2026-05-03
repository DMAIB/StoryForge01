import React, { useState, useEffect } from 'react';

const ProductImage = ({ src, alt, className, placeholder }) => {
  const [imgSrc, setImgSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setImgSrc(placeholder);
      setIsLoading(false);
      setHasError(true);
      return;
    }

    // Если src совпадает с placeholder - не проверяем
    if (src === placeholder) {
      setImgSrc(placeholder);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    // Создаем временное изображение для проверки
    const tempImg = new Image();
    
    // Таймаут - если за 3 секунды не загрузилось - считаем ошибкой
    const timeoutId = setTimeout(() => {
      setImgSrc(placeholder);
      setIsLoading(false);
      setHasError(true);
    }, 3000);
    
    tempImg.onload = () => {
      clearTimeout(timeoutId);
      setImgSrc(src);
      setIsLoading(false);
      setHasError(false);
    };
    
    tempImg.onerror = () => {
      clearTimeout(timeoutId);
      setImgSrc(placeholder);
      setIsLoading(false);
      setHasError(true);
    };
    
    tempImg.src = src;
    
    // Cleanup
    return () => {
      clearTimeout(timeoutId);
    };
  }, [src, placeholder]);

  // Показываем индикатор загрузки
  if (isLoading) {
    return (
      <div className={`${className} image-placeholder-loading`}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = placeholder;
      }}
    />
  );
};

export default ProductImage;