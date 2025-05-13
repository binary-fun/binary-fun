import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import { ChartService } from './services/ChartService.tsx';
import { GameService } from './services/GameService.tsx';
import { AudioService } from './services/AudioService.tsx';
import { Game } from './core/Game.tsx';
import App from './components/App';

// サービスのインスタンスを作成
const chartService = new ChartService(150, 1000, 0.01);
const gameService = new GameService(chartService);
const audioService = new AudioService();

// ゲームのインスタンスを作成
const game = new Game(
  chartService,
  gameService,
  audioService,
  {
    roundDurationMs: 60000, // 1分
    roundIntervalMs: 5000,  // 5秒
    winMultiplier: 1.95,    // 勝利時の倍率
    initialBalance: 10000,  // 初期残高
  }
);

// アプリケーションをレンダリング
ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App game={game} chartService={chartService} />
  </React.StrictMode>
);
