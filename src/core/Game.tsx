import type { IChartService } from '../services/ChartService.tsx';
import type { IGameService } from '../services/GameService.tsx';
import type { IAudioService } from '../services/AudioService.tsx';
import { GameResult } from '../models/GameResult.tsx';

/**
 * ゲームの状態を表す型
 */
export type GameState = 'waiting' | 'running' | 'finished';

/**
 * ゲームの設定を表すインターフェース
 */
export interface GameConfig {
  roundDurationMs: number;
  roundIntervalMs: number;
  winMultiplier: number;
  initialBalance: number;
}

/**
 * ゲームのイベントを表す型
 */
export type GameEvent = 
  | { type: 'round_start'; timestamp: number; price: number }
  | { type: 'round_end'; timestamp: number; results: GameResult[] }
  | { type: 'prediction_made'; direction: 'up' | 'down'; amount: number; price: number }
  | { type: 'balance_changed'; newBalance: number; change: number }
  | { type: 'countdown'; remainingSeconds: number }
  | { type: 'result'; result: GameResult; winStreak: number };

/**
 * ゲームのコアロジックを担当するクラス
 * 単一責任の原則：ゲームのコアロジックの管理のみを担当
 * 依存性逆転の原則：高レベルモジュールが低レベルモジュールに依存しない
 */
export class Game {
  private _chartService: IChartService;
  private _gameService: IGameService;
  private _audioService: IAudioService;
  private _config: GameConfig;
  private _state: GameState;
  private _balance: number;
  private _userId: string;
  private _eventListeners: ((event: GameEvent) => void)[];
  private _countdownIntervalId: number | null;
  private _winStreak: number = 0;

  constructor(
    chartService: IChartService,
    gameService: IGameService,
    audioService: IAudioService,
    config: GameConfig = {
      roundDurationMs: 60000, // 1分
      roundIntervalMs: 5000,  // 5秒
      winMultiplier: 1.8,     // 勝利時の配当倍率
      initialBalance: 10000,  // 初期残高
    },
    userId: string = 'player1'
  ) {
    this._chartService = chartService;
    this._gameService = gameService;
    this._audioService = audioService;
    this._config = config;
    this._state = 'waiting';
    this._balance = config.initialBalance;
    this._userId = userId;
    this._eventListeners = [];
    this._countdownIntervalId = null;

    // 結果の購読
    this._gameService.subscribeToResults(this.handleGameResult.bind(this));
  }

  /**
   * ゲームを開始
   */
  start(): void {
    if (this._state === 'running') return;

    this._state = 'running';
    this._audioService.playBackgroundMusic();

    // 現在のラウンド情報を取得
    const currentRound = this._gameService.getCurrentRound();
    
    // ラウンド開始イベントを発火
    this.emitEvent({
      type: 'round_start',
      timestamp: currentRound.startTime,
      price: currentRound.startPrice,
    });

    // カウントダウンを開始
    this.startCountdown();
  }

  /**
   * ゲームを停止
   */
  stop(): void {
    if (this._state !== 'running') return;

    this._state = 'finished';
    this._audioService.stopBackgroundMusic();

    // カウントダウンを停止
    this.stopCountdown();
  }

  /**
   * 予測を行う
   */
  makePrediction(direction: 'up' | 'down', amount: number): void {
    if (this._state !== 'running') {
      throw new Error('ゲームが実行中ではありません');
    }

    if (amount <= 0 || amount > this._balance) {
      throw new Error('無効な金額です');
    }

    try {
      // 予測を行う
      this._gameService.makePrediction(direction, amount, this._userId);

      // クリック音を再生
      this._audioService.playClickSound();

      // 予測ラインを設定（方向を渡す）し、現在の正確な価格を取得
      const currentPrice = this._chartService.markPredictionPoint(direction);

      // 予測イベントを発火
      this.emitEvent({
        type: 'prediction_made',
        direction,
        amount,
        price: currentPrice // 予測時の正確な価格を含める
      });
    } catch (error) {
      console.error('予測に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 残高を更新
   */
  private updateBalance(change: number): void {
    this._balance += change;
    
    // 残高変更イベントを発火
    this.emitEvent({
      type: 'balance_changed',
      newBalance: this._balance,
      change,
    });
  }

  /**
   * ゲーム結果を処理
   */
  private handleGameResult(result: GameResult): void {
    // 自分の予測結果のみ処理
    if (result.prediction.userId !== this._userId) return;

    // 価格変動率に基づいて損益を計算
    const priceChangePercentage = Math.abs(result.getPriceChangePercentage());
    const amountChange = Math.round(result.prediction.amount * priceChangePercentage / 100);

    // 勝利した場合は報酬を加算し、Win Streakを増加
    if (result.status === 'win') {
      this.updateBalance(amountChange);
      this._winStreak += 1;
      this._audioService.playWinSound();
    } else {
      // 敗北した場合は差額分だけ減額し、Win Streakをリセット
      this.updateBalance(-amountChange);
      this._winStreak = 0;
      this._audioService.playLoseSound();
    }

    // 結果イベントを発火（App.tsxで処理するため）
    this.emitEvent({
      type: 'result',
      result,
      winStreak: this._winStreak
    });
  }

  /**
   * カウントダウンを開始
   */
  private startCountdown(): void {
    if (this._countdownIntervalId !== null) {
      this.stopCountdown();
    }

    this._countdownIntervalId = window.setInterval(() => {
      const currentRound = this._gameService.getCurrentRound();
      const remainingMs = currentRound.getRemainingTimeMs();
      const remainingSeconds = Math.ceil(remainingMs / 1000);

      // カウントダウンイベントを発火
      this.emitEvent({
        type: 'countdown',
        remainingSeconds,
      });

      // 残り10秒以下でカウントダウン音を再生
      if (remainingSeconds <= 10 && remainingSeconds > 0) {
        this._audioService.playCountdownSound();
      }
    }, 1000);
  }

  /**
   * カウントダウンを停止
   */
  private stopCountdown(): void {
    if (this._countdownIntervalId !== null) {
      clearInterval(this._countdownIntervalId);
      this._countdownIntervalId = null;
    }
  }

  /**
   * イベントリスナーを追加
   */
  addEventListener(callback: (event: GameEvent) => void): () => void {
    this._eventListeners.push(callback);
    
    // リスナー削除関数を返す
    return () => {
      const index = this._eventListeners.indexOf(callback);
      if (index !== -1) {
        this._eventListeners.splice(index, 1);
      }
    };
  }

  /**
   * イベントを発火
   */
  private emitEvent(event: GameEvent): void {
    for (const listener of this._eventListeners) {
      listener(event);
    }
  }

  /**
   * 残高を取得
   */
  getBalance(): number {
    return this._balance;
  }
  
  /**
   * Win Streakを取得
   */
  getWinStreak(): number {
    return this._winStreak;
  }

  /**
   * 状態を取得
   */
  getState(): GameState {
    return this._state;
  }

  /**
   * 設定を取得
   */
  getConfig(): GameConfig {
    return { ...this._config };
  }

  /**
   * 設定を更新
   */
  updateConfig(config: Partial<GameConfig>): void {
    this._config = { ...this._config, ...config };
  }
}
