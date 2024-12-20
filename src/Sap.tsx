import React, { useState, useEffect, useRef } from 'react';
import './Sap.css';
import { mina, flg } from './images';
import { useLanguage } from './LanguageContext';

interface Cell {
  isMine: boolean;
  isOpen: boolean;
  isFlagged: boolean;
  adjacentMines: number;
  isMistake?: boolean; // Новое свойство для пометки ошибочных флагов
}


interface SapProps {
  setCurrentPage: (page: string) => void;
  attemptsLeft: number; // Количество оставшихся попыток
  updateAttempts: (newAttempts: number) => void; // Функция для обновления количества попыток
  activateBuffSap: () => void;
}

const generateField = (rows: number, cols: number, mineCount: number): Cell[][] => {
  const field: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      isOpen: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  );


  let minesPlaced = 0;
  while (minesPlaced < mineCount) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    if (!field[row][col].isMine) {
      field[row][col].isMine = true;
      minesPlaced++;
    }
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (field[row][col].isMine) continue;

      let mineCount = 0;
      for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
          const nr = row + r;
          const nc = col + c;
          if (
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            field[nr][nc].isMine
          ) {
            mineCount++;
          }
        }
      }
      field[row][col].adjacentMines = mineCount;
    }
  }

  return field;
};

const Sap: React.FC<SapProps> = ({ setCurrentPage, attemptsLeft, updateAttempts, activateBuffSap }) => {
  const rows = 9;
  const cols = 7;
  const mineCount = 1;
  const timeLimit = 100;

  const [field, setField] = useState<Cell[][]>(() => generateField(rows, cols, mineCount));
  const [gameOver, setGameOver] = useState(false);
  const [, setVictory] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isFlagMode, setIsFlagMode] = useState(false);
  const [hasInteracted,] = useState(false);
  const [showModal, setShowModal] = useState<'win' | 'lose' | null>(null);

  const { language } = useLanguage();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (attemptsLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameOver(true);
          setShowModal('lose');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [attemptsLeft]);

  const openCell = (row: number, col: number) => {
    if (gameOver || field[row][col].isOpen || field[row][col].isFlagged) return;
  
    const newField = field.map((r) =>
      r.map((c) => ({
        ...c,
      }))
    );
  
    const cell = newField[row][col];
    if (cell.isMine) {
      cell.isOpen = true;
      setGameOver(true);
      setShowModal('lose');
    } else {
      revealCells(newField, row, col);
      checkVictory(newField);
    }
    setField(newField);
  };
  
  
  

  const revealCells = (field: Cell[][], row: number, col: number) => {
    const stack = [[row, col]];
    while (stack.length > 0) {
      const [r, c] = stack.pop()!;
      const cell = field[r][c];
      if (cell.isOpen) continue;

      cell.isOpen = true;
      if (cell.adjacentMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (
              nr >= 0 &&
              nr < rows &&
              nc >= 0 &&
              nc < cols &&
              !field[nr][nc].isOpen &&
              !field[nr][nc].isMine
            ) {
              stack.push([nr, nc]);
            }
          }
        }
      }
    }
  };

  

  const toggleFlag = (row: number, col: number) => {
    if (gameOver || field[row][col].isOpen) return;

    const newField = field.slice();
    newField[row][col].isFlagged = !newField[row][col].isFlagged;
    setField(newField);
  };

  const checkVictory = (field: Cell[][]) => {
    if (field.every(row => row.every(cell => cell.isMine || cell.isOpen))) {
      setVictory(true);
      setShowModal('win');
      clearInterval(timerRef.current!);
      activateBuffSap();
    }
  };
  
  const closeModal = () => {
    setShowModal(null);
    handleExit();
  };

  const handleExit = () => {
    if (hasInteracted && attemptsLeft > 0) {
      updateAttempts(attemptsLeft - 1); // Уменьшаем количество попыток
    }
    setCurrentPage('home');
  };

  // Если попытки закончились
  if (attemptsLeft <= 0) {
    return (
      <div className="sapme">
        <h1>{language === 'ru' ? 'Сапёр' : 'Sapper'}</h1>
        <h2>{language === 'ru' ? 'У вас закончились попытки' : 'You run out of attempts'}!</h2>
        <button onClick={() => setCurrentPage('home')}>{language === 'ru' ? 'Назад' : 'Back'}</button>
      </div>
    );
  }

  return (
    <div className="sap-game">
      <h1>{language === 'ru' ? 'Сапёр' : 'Sapper'}</h1>
      <div>{language === 'ru' ? 'Оставшееся время' : 'Remaining time'}: {timeLeft} {language === 'ru' ? 'ceк' : 'sec'}</div>
      

      <button className="flag-mode-button" onClick={() => setIsFlagMode(!isFlagMode)}>
        <img src={isFlagMode ? flg : mina} alt="Переключить режим" />
      </button>

      <div className="sap-field">
        {field.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              className={`cell ${cell.isOpen ? 'open' : ''} ${cell.isMine && gameOver ? 'mine' : ''} ${cell.isFlagged ? 'flag' : ''} ${cell.isMistake ? 'mistake' : ''}`}
              data-adjacent={cell.isOpen && cell.adjacentMines > 0 ? cell.adjacentMines : undefined}
              onClick={() => (isFlagMode ? toggleFlag(rIdx, cIdx) : openCell(rIdx, cIdx))}
            >
              {cell.isOpen && cell.adjacentMines > 0 && !cell.isMine && cell.adjacentMines}
            </div>
          ))
        )}
      </div>
      <button className="restart-button" onClick={handleExit}>
      {language === 'ru' ? 'Назад' : 'Back'}
      </button>
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{showModal === 'win' ? (language === 'ru' ? 'Победа!' : 'Victory!') : (language === 'ru' ? 'Проиграл!' : 'Defeat!')}</h2>
            {showModal === 'win' && <p>{language === 'ru' ? 'Награда: Восстановление 35% энергии от недостающей за 20 с' : 'Reward: Restore 35% of the missing energy in 20 s'}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sap;
