import { useEffect, useState } from 'react';
import './App.css';
import { bear, coin as coinImage, highVoltage, shp, trophy, notcoin, sett } from './images';
import loadingMp4 from './images/103APP.webm';
import Shop from './Shop';
import Setting from './Setting';

function App() {
  const initialMaxEnergy = 500; // Старт энергия
  const energyToReduce = 1; // Энергия за нажатие
  const recoveryInterval = 1000; // Интервал времени 1000 - 1 сек

  const [maxEnergy, setMaxEnergy] = useState(() => {
    const savedMaxEnergy = localStorage.getItem('maxEnergy');
    return savedMaxEnergy ? parseInt(savedMaxEnergy, 10) : initialMaxEnergy;
  });

  const [energyRecoveryRate, setEnergyRecoveryRate] = useState(1); // Кол-во энергии в сек
  const [energy, setEnergy] = useState(() => {
    const savedEnergy = localStorage.getItem('energy');
    return savedEnergy ? parseInt(savedEnergy, 10) : maxEnergy;
  });

  const [lastUpdateTime, setLastUpdateTime] = useState(() => {
    const savedTime = localStorage.getItem('lastUpdateTime');
    return savedTime && !isNaN(parseInt(savedTime, 10)) ? parseInt(savedTime, 10) : Date.now();
  });

  const [isLoading, setIsLoading] = useState(true); // Заставка
  const [points, setPoints] = useState(() => {
    const savedPoints = localStorage.getItem('points');
    return savedPoints ? parseInt(savedPoints, 10) : 0;
  });

  const [coins, setCoins] = useState<{ id: number, x: number, y: number }[]>([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [isShaking, setIsShaking] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState(1)

  // Рассчитываем восстановленную энергию на основе времени
  const calculateRecoveredEnergy = () => {
    if (isNaN(energy)) {
      return maxEnergy; // Если энергия не определена, возвращаем максимальное значение
    }
    
    const currentTime = Date.now();
    const timeElapsed = currentTime - lastUpdateTime;
    const energyRecovered = Math.floor((timeElapsed / recoveryInterval) * energyRecoveryRate);
    return Math.min(energy + energyRecovered, maxEnergy);
  };

  const [showSettings, setShowSettings] = useState(false); // для управления отображением настроек

  // Функция для обработки клика по кнопке "Setting"
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  useEffect(() => {
    // Показать заставку в течение 7 секунд
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 7000); // 7 секунды заставка

    return () => clearTimeout(timer); // Очищаем таймер, если компонент размонтируется
  }, []);

  useEffect(() => {
    // Восстанавливаем энергию при загрузке приложения
    const recoveredEnergy = calculateRecoveredEnergy();
    setEnergy(recoveredEnergy);
    setLastUpdateTime(Date.now());
  }, []);

  useEffect(() => {
    // Сохраняем энергию и время в localStorage при изменении энергии
    localStorage.setItem('energy', energy.toString());
    localStorage.setItem('lastUpdateTime', lastUpdateTime.toString());
  }, [energy, lastUpdateTime]);

  useEffect(() => {
    // Восстановление энергии каждые 1000ms
    const interval = setInterval(() => {
      setEnergy((prevEnergy) => {
        const newEnergy = Math.min(prevEnergy + energyRecoveryRate, maxEnergy);
        setLastUpdateTime(Date.now());
        return newEnergy;
      });
    }, recoveryInterval);

    return () => clearInterval(interval);
  }, [energyRecoveryRate, maxEnergy]); // Добавляем зависимость от maxEnergy

  useEffect(() => {
    // Сохраняем максимальную энергию в localStorage при её изменении
    localStorage.setItem('maxEnergy', maxEnergy.toString());
    if (energy > maxEnergy) {
      setEnergy(maxEnergy); // Обновляем энергию, если она превышает новый максимум
    }
  }, [maxEnergy, energy]);

  useEffect(() => {
    const savedPointsToAdd = localStorage.getItem('pointsToAdd');
    if (savedPointsToAdd) {
      setPointsToAdd(parseInt(savedPointsToAdd, 10)); // Восстановление Тапа
    }
  
    const savedEnergyRecoveryRate = localStorage.getItem('energyRecoveryRate');
    if (savedEnergyRecoveryRate) {
      setEnergyRecoveryRate(parseInt(savedEnergyRecoveryRate, 10)); // Восстановление регенерации
    }
  }, []);  

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (energy - energyToReduce < 0) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPoints((prevPoints) => {
      const newPoints = prevPoints + pointsToAdd;
      localStorage.setItem('points', newPoints.toString());
      return newPoints;
    });

    setEnergy(energy - energyToReduce < 0 ? 0 : energy - energyToReduce);

    // Добавляем новую монету
    setCoins((prevCoins) => [...prevCoins, { id: Date.now() + 1000, x, y }]);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleCoinAnimationEnd = (id: number) => {
    setCoins((prevCoins) => prevCoins.filter(coin => coin.id !== id));
  };

  const renderContent = () => {
    console.log("Текущая страница:", currentPage); // Отладочная информация
    switch (currentPage) {
      case 'home':
        return (
          <>
            <div style={{ position: 'relative' }}>
              <div
                className="absolute text-5xl font-bold flex items-center"
                style={{ top: '95px', left: '50%', transform: 'translateX(-50%)' }}
              >
                <img src={coinImage} width={44} height={44} alt="Static Coin" />
                <span className="ml-2">{points.toLocaleString()}</span>
              </div>
              <div
                className="absolute text-base flex items-center"
                style={{ top: 'calc(110px + 44px)', left: '50%', transform: 'translateX(-50%)' }}
              >
                <img src={trophy} width={24} height={24} />
                <span className="ml-1">Gold</span>
              </div>
            </div>
          </>
        );
      case 'str4':
        return <h2>Страница "Str4"</h2>;
      case 'frend':
        return <h2>Страница "Frend"</h2>;
      case 'earn':
        return <h2>Страница "Earn"</h2>;
      case 'shop':
        return (
          <Shop
            points={points}
            setPoints={setPoints}
            setCurrentPage={setCurrentPage}
            setMaxEnergy={setMaxEnergy}
            setEnergyRecoveryRate={setEnergyRecoveryRate}
            setPointsToAdd={setPointsToAdd}
          />
        );
      case 'str5':
        return <h2>Страница "Str5"</h2>;
      case 'str6':
        return <h2>Страница "Str6"</h2>;
      case 'str7':
        return <h2>Страница "Str7"</h2>;
      case 'str8':
        return <h2>Страница "Str8"</h2>;
      default:
        return <h2>Неизвестная страница</h2>;
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen" style={{ pointerEvents: 'none' }}>
        <video 
          src={loadingMp4}
          autoPlay
          muted={false}
          playsInline
          onLoadedData={() => console.log("Видео загружено")}
          onError={() => setIsLoading(false)}
          onEnded={() => setIsLoading(false)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  return (
    <div className="bg-gradient-main min-h-screen px-4 flex flex-col items-center text-white font-medium">
      <div className="absolute inset-0 h-1/2 bg-gradient-overlay z-0"></div>
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="radial-gradient-overlay"></div>
      </div>
  
      <div className="w-full z-10 min-h-screen flex flex-col items-center text-white">
  
        {/* Верхний блок с кнопками (str5, str6, str7, str8) */}
        <div className="fixed top-4 left-0 w-full px-4 flex justify-center z-10">
          <div className="w-full max-w-md bg-[#91bfa9] py-4 rounded-2xl flex justify-around">
            <button className="flex flex-col items-center gap-1" onClick={() => setCurrentPage('str5')}>
              <img src={shp} width={24} height={24} alt="Str5" />
              <span>Str5</span>
            </button>
            <div className="h-[48px] w-[2px] bg-[#fddb6d]"></div>
            <button className="flex flex-col items-center gap-1" onClick={() => setCurrentPage('str6')}>
              <img src={shp} width={24} height={24} alt="Str6" />
              <span>Top</span>
            </button>
            <div className="h-[48px] w-[2px] bg-[#fddb6d]"></div>
            <button className="flex flex-col items-center gap-1" onClick={() => setCurrentPage('str7')}>
              <img src={shp} width={24} height={24} alt="Str7" />
              <span>Quest</span>
            </button>
            <div className="h-[48px] w-[2px] bg-[#fddb6d]"></div>
            <button className="flex flex-col items-center gap-1" onClick={() => setCurrentPage('str8')}>
              <img src={shp} width={24} height={24} alt="Str8" />
              <span>Airdrop</span>
            </button>
          </div>
        </div>

        {/*Кнопка настрек*/}
        <button className="setting-button fixed top-20 right-4" style={{ marginTop: '30px' }} onClick={toggleSettings}>
          <img src={sett} alt="Setting" width={24} height={24} />
        </button>
          {showSettings && (
        <Setting onClose={toggleSettings} />
          )}
  
        {/* Отображение содержимого с использованием renderContent */}
        <div className="fixed top-20 left-0 w-full px-4 pt-2 z-20 flex flex-col items-center text-white">
          {renderContent()}
        </div>
  
        <div className="flex-grow flex flex-col items-center justify-center relative" style={{ marginTop: '80px' }}>
          <div className="relative mb-4" onClick={handleClick}>
            <img src={notcoin} width={180} height={180} className={isShaking ? 'shake' : ''} alt="notcoin" />
            {coins.map((coin) => (
              <div
                key={coin.id}
                className="absolute opacity-100 coin"
                style={{
                  top: `${coin.y}px`,
                  left: `${coin.x}px`,
                  animation: `fall 1s ease forwards`
                }}
                onAnimationEnd={() => handleCoinAnimationEnd(coin.id)}
              >
                <img src={coinImage} alt="Coin" width={30} height={30} />
              </div>
            ))}
          </div>

          {/* Энергия под монетой */}
          <div className="flex flex-col items-center mt-2">
            <div className="flex items-center justify-center">
             <img src={highVoltage} width={24} height={24} alt="HighVoltage" className="mr-2" />
              <span className="text-white text-xl font-bold">{energy}</span>
            </div>
            <span className="text-white opacity-75 text-sm">/ {maxEnergy}</span>
    
            {/* Увеличенная полоска энергии */}
            <div className="bg-[#f9c035] rounded-full mt-2" style={{ width: '300px' }}>
              <div className="bg-gradient-to-r from-[#f3c45a] to-[#fffad0] h-4 rounded-full" style={{ width: `${(energy /  maxEnergy) * 100}%` }}>
              </div>
            </div>
          </div>
        </div>
  
        {/* Нижний блок с кнопками (frend, earn, shop, str4) */}
        <div className="fixed bottom-4 left-0 w-full px-4 flex justify-center z-10">
          <div className="w-full max-w-md bg-[#91bfa9] py-4 rounded-2xl flex justify-around">
            <button className="flex flex-col items-center gap-1" onClick={() => setCurrentPage('frend')}>
              <img src={bear} width={24} height={24} alt="Frend" />
              <span>Frend</span>
            </button>
            <div className="h-[48px] w-[2px] bg-[#fddb6d]"></div>
            <button className="flex flex-col items-center gap-1" onClick={() => setCurrentPage('earn')}>
              <img src={coinImage} width={24} height={24} alt="Earn" />
              <span>Earn</span>
            </button>
            <div className="h-[48px] w-[2px] bg-[#fddb6d]"></div>
            <button className="flex flex-col items-center gap-1" onClick={() => setCurrentPage('str4')}>
              <img src={shp} width={24} height={24} alt="Str4" />
              <span>Str4</span>
            </button>
            <div className="h-[48px] w-[2px] bg-[#fddb6d]"></div>
            <button className="flex flex-col items-center gap-1" onClick={() => setCurrentPage('shop')}>
              <img src={shp} width={24} height={24} alt="Shop" />
              <span>Shop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  

  
}

export default App;
