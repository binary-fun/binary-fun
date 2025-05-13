import React, { useEffect, useState } from 'react';
import ChartComponent from './ChartComponent';
import TimerComponent from './TimerComponent';
import PredictionComponent from './PredictionComponent';
import ResultComponent from './ResultComponent';
import type { GameResult } from '../models/GameResult.tsx';
import type { PredictionDirection } from '../models/Prediction.tsx';
import type { Game } from '../core/Game.tsx';
import type { ChartService } from '../services/ChartService.tsx';

interface AppProps {
  game: Game;
  chartService: ChartService;
}

// メインアプリケーションコンポーネント
const App: React.FC<AppProps> = ({ game, chartService }) => {
  const [balance, setBalance] = useState(10000);
  const [results, setResults] = useState<GameResult[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionPrice, setPredictionPrice] = useState<number | null>(null);
  const [predictionDirection, setPredictionDirection] = useState<PredictionDirection | null>(null);
  const [winStreak, setWinStreak] = useState(0);
  
  useEffect(() => {
    // ゲームイベントをサブスクライブ
    const handleGameEvent = (event: any) => {
      if (event.type === 'balance_changed') {
        setBalance(game.getBalance());
      } else if (event.type === 'prediction_made') {
        // 予測時の価格を記録
        setPredictionPrice(event.price);
        // 予測方向を設定
        setPredictionDirection(event.direction);
      } else if (event.type === 'result') {
        // 結果を追加
        setResults(prev => [event.result, ...prev].slice(0, 10));
        // 結果が出たら予測価格と予測方向をリセット
        setPredictionPrice(null);
        setPredictionDirection(null);
        // Win Streakを更新
        setWinStreak(event.winStreak);
      } else if (event.type === 'countdown') {
        // カウントダウンを更新
        setRemainingTime(event.remainingSeconds);
      }
    };
    
    // イベントリスナーを登録
    const unsubscribe = game.addEventListener(handleGameEvent);
    
    // ゲームを開始
    game.start();
    
    return () => {
      // クリーンアップ
      unsubscribe();
      game.stop();
    };
  }, [game]);
  
  const [remainingTime, setRemainingTime] = useState(60);
  
  const handlePrediction = (direction: PredictionDirection, amount: number) => {
    setIsPredicting(true);
    setPredictionDirection(direction);
    game.makePrediction(direction, amount);
    setTimeout(() => {
      setIsPredicting(false);
    }, 1000);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-solana-dark to-black text-white">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-solana-purple to-solana-green flex items-center justify-center mr-3">
              <span className="text-xl font-bold">B</span>
            </div>
            <h1 className="text-3xl font-bold gradient-text">Binary.fun</h1>
          </div>
          
          {/* バランス表示を右上に配置 */}
          <div className="flex items-center">
            <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-solana-green/30 flex items-center">
              <div className="mr-2 text-sm text-gray-400">Balance:</div>
              <div className="text-xl font-bold text-green-400">
                <span className="flex items-center">
                  {balance.toLocaleString()} SOL
                </span>
              </div>
            </div>
            
            <div className="hidden md:flex space-x-6 text-sm ml-6">
              <a href="#" className="hover:text-solana-green transition-colors">Home</a>
              <a href="#" className="hover:text-solana-green transition-colors">How to Play</a>
              <a href="#" className="hover:text-solana-green transition-colors">Leaderboard</a>
              <a href="#" className="hover:text-solana-green transition-colors">About</a>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-700 shadow-glow">
              <ChartComponent 
                predictionPrice={predictionPrice} 
                predictionDirection={predictionDirection}
                remainingTime={remainingTime}
                chartService={chartService}
              />
              {predictionPrice && (
                <div className="mt-2 text-center text-yellow-400 font-semibold">
                  Prediction Price: ${predictionPrice.toFixed(2)}
                </div>
              )}
            </div>
            {/* Time Remainingのセクションを削除 */}
            {/* How It Works */}
            <div className="mt-6 bg-gray-800 bg-opacity-50 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700 shadow-glow">
              <h2 className="text-xl font-bold gradient-text mb-4">How It Works</h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-300">
                <li className="flex items-center">
                  <span className="bg-black bg-opacity-30 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                  Watch the price chart movements
                </li>
                <li className="flex items-center">
                  <span className="bg-black bg-opacity-30 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                  Predict if the price will go UP or DOWN
                </li>
                <li className="flex items-center">
                  <span className="bg-black bg-opacity-30 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                  Enter your prediction amount
                </li>
                <li className="flex items-center">
                  <span className="bg-black bg-opacity-30 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
                  Wait 60 seconds for the result
                </li>
                <li className="flex items-center">
                  <span className="bg-black bg-opacity-30 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">5</span>
                  Get PAYOUT based on price difference after 60 seconds
                </li>
              </ol>
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Win Streak Bonus - 縦並び */}
              <div className="col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-xl border border-gray-700 shadow-glow">
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold gradient-text">Win Streak</h2>
                  <div className="flex flex-row items-end gap-4 px-2">
                    <div className="text-4xl font-bold text-solana-green mt-2">{winStreak}</div>
                    <div className="text-xs text-gray-400 mt-1">Next: +10%</div>
                  </div>
                </div>
              </div>
              
              {/* JACKPOT - 縦並び */}
              <div className="col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-xl border border-gray-700 shadow-glow">
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold gradient-text">JACKPOT</h2>
                  <div className="text-2xl font-bold text-yellow-400 mt-2 px-2">5,000 SOL</div>
                </div>
              </div>
              
              {/* Prediction Buttons */}
              <div className="col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl border border-gray-700 shadow-glow">
                <PredictionComponent onPrediction={handlePrediction} disabled={isPredicting} remainingTime={remainingTime} />
              </div>
              
              {/* 結果表示 */}
              <div className="col-span-2">
                <ResultComponent results={results} />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="container mx-auto py-6 px-4 mt-8 border-t border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500">© 2025 Binary.fun - Demo Version</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
