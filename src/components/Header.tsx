import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserData } from '../utils/telegram';
import './Header.css';

const Header: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const userData = getUserData();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  return (
    <header className="header">
      <div className="header-content">
        {userData && (
          <div className="user-info">
            {userData.photoUrl && (
              <img 
                src={userData.photoUrl} 
                alt={userData.firstName} 
                className="user-avatar"
              />
            )}
            <span className="user-name">
              {userData.firstName} {userData.lastName}
            </span>
          </div>
        )}
        <button 
          className="language-toggle"
          onClick={toggleLanguage}
          aria-label="Toggle language"
        >
          {language === 'en' ? '🇷🇺 RU' : '🇬🇧 EN'}
        </button>
      </div>
    </header>
  );
};

export default Header;