import React, { useEffect, useState } from 'react';
import IconSelector from './IconSelector';
import './Profil.css';

type ProfilProps = {
  username: string;
  selectedIcon: string;
  setSelectedIcon: (icon: string) => void;
  onBack: () => void;
};

const Profil: React.FC<ProfilProps> = ({ username, selectedIcon, setSelectedIcon, onBack }) => {
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [daysSinceFirstLogin, setDaysSinceFirstLogin] = useState(0);
  const [registrationDate, setRegistrationDate] = useState('');

  useEffect(() => {
    const firstLoginDate = localStorage.getItem('firstLoginDate');
    if (!firstLoginDate) {
      const today = new Date().toISOString();
      localStorage.setItem('firstLoginDate', today);
      setRegistrationDate(new Date(today).toLocaleDateString());
      setDaysSinceFirstLogin(0);
    } else {
      const firstLogin = new Date(firstLoginDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - firstLogin.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysSinceFirstLogin(diffDays);
      setRegistrationDate(firstLogin.toLocaleDateString());
    }
  }, []);

  return (
    <div className="profil-modal">
      {!showIconSelector ? (
        <div className="profil-container">
          <div className="profil-header">
            <h2>Профиль</h2>
          </div>
          <div className="profil-content">
            <img
              src={selectedIcon}
              alt="User Avatar"
              className="avatar"
              onClick={() => setShowIconSelector(true)} // Открываем выбор иконки при клике
            />
            <ul className="profil-info-list">
              <li>
                <strong>Ник:</strong> {username}
              </li>
              <li>
                <strong>Количество дней в игре:</strong> {daysSinceFirstLogin}
              </li>
              <li>
                <strong>Дата регистрации:</strong> {registrationDate}
              </li>
            </ul>
          </div>
          <div className="profil-footer">
            <button className="close-button" onClick={onBack}>
              ✖
            </button>
          </div>
        </div>
      ) : (
        <IconSelector
          selectedIcon={selectedIcon}
          setSelectedIcon={(icon) => {
            setSelectedIcon(icon);
            setShowIconSelector(false); // Закрываем IconSelector после выбора
          }}
          setCurrentPage={() => {}} // Не используем переход между страницами
          closeIconSelector={() => setShowIconSelector(false)} // Закрыть окно выбора аватара
        />
      )}
    </div>
  );
};

export default Profil;
