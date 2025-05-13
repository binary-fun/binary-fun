import React, { useEffect, useState } from 'react';
import type { Game } from '../core/Game.tsx';

// タイマーコンポーネント
interface TimerProps {
  totalSeconds: number;
  game: Game;
}

const TimerComponent: React.FC<TimerProps> = ({ totalSeconds, game }) => {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  
  useEffect(() => {
    // ゲームイベントをサブスクライブ
    const handleGameEvent = (event: any) => {
      if (event.type === 'countdown') {
        setRemainingSeconds(event.remainingSeconds);
      }
    };
    
    game.addEventListener(handleGameEvent);
    
    return () => {
      // クリーンアップ
      // 元のコードではクリーンアップが空でした
    };
  }, [game]);
  
  // 残り時間に基づいてテキストの色を決定
  const getTimerColor = () => {
    if (remainingSeconds <= 10) return 'text-red-500'; // 危険
    if (remainingSeconds <= 20) return 'text-yellow-400'; // 警告
    return 'text-white'; // 通常
  };
  
  // 残り時間を分:秒形式でフォーマット
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex flex-col items-center bg-gray-800 bg-opacity-50 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg border border-gray-700 shadow-glow">
      <div className={`text-4xl font-bold ${getTimerColor()}`}>
        {formatTime(remainingSeconds)}
      </div>
      <div className="text-sm text-gray-400">Time Remaining</div>
    </div>
  );
};

export default TimerComponent;
