import { ChartData } from '../models/ChartData.tsx';
import { Prediction, PredictionDirections } from '../models/Prediction.tsx';
import { GameResult } from '../models/GameResult.tsx';
import type { IChartService } from './ChartService';

/**
 * ゲームサービスのインターフェース
 * インターフェース分離の原則：クライアントが必要としないメソッドへの依存を強制しない
 */
export interface IGameService {
  makePrediction(direction: 'up' | 'down', amount: number, userId: string): Prediction;
  getCurrentRound(): GameRound;
  getResults(): GameResult[];
  subscribeToResults(callback: (result: GameResult) => void): () => void;
}

/**
 * ゲームラウンドを表現するクラス
 */
export class GameRound {
  private _startTime: number;
  private _endTime: number;
  private _startPrice: number;
  private _predictions: Prediction[];
  private _isActive: boolean;

  constructor(startTime: number, durationMs: number, startPrice: number) {
    this._startTime = startTime;
    this._endTime = startTime + durationMs;
    this._startPrice = startPrice;
    this._predictions = [];
    this._isActive = true;
  }

  get startTime(): number {
    return this._startTime;
  }

  get endTime(): number {
    return this._endTime;
  }

  get startPrice(): number {
    return this._startPrice;
  }

  get predictions(): Prediction[] {
    return [...this._predictions];
  }

  get isActive(): boolean {
    return this._isActive;
  }

  addPrediction(prediction: Prediction): void {
    if (this._isActive) {
      this._predictions.push(prediction);
    }
  }

  close(): void {
    this._isActive = false;
  }

  getRemainingTimeMs(): number {
    const now = Date.now();
    return Math.max(0, this._endTime - now);
  }
}

/**
 * ゲームのロジックを管理するサービス
 * 単一責任の原則：ゲームロジックの管理のみを担当
 * 依存性逆転の原則：高レベルモジュールが低レベルモジュールに依存しない
 */
export class GameService implements IGameService {
  private _chartService: IChartService;
  private _currentRound: GameRound | null;
  private _results: GameResult[];
  private _subscribers: ((result: GameResult) => void)[];
  private _roundDurationMs: number;
  private _roundIntervalMs: number;
  private _intervalId: number | null;
  private _winMultiplier: number;

  constructor(
    chartService: IChartService,
    roundDurationMs: number = 60000, // 1分
    roundIntervalMs: number = 5000,  // 5秒
    winMultiplier: number = 1.8      // 勝利時の配当倍率
  ) {
    this._chartService = chartService;
    this._currentRound = null;
    this._results = [];
    this._subscribers = [];
    this._roundDurationMs = roundDurationMs;
    this._roundIntervalMs = roundIntervalMs;
    this._intervalId = null;
    this._winMultiplier = winMultiplier;

    // ゲームサイクルを開始
    this.startGameCycle();
  }

  /**
   * 予測を行う
   */
  makePrediction(direction: 'up' | 'down', amount: number, userId: string): Prediction {
    if (!this._currentRound || !this._currentRound.isActive) {
      throw new Error('現在のラウンドがアクティブではありません');
    }

    const predictionDirection = direction === 'up' ? PredictionDirections.UP : PredictionDirections.DOWN;
    const prediction = new Prediction(predictionDirection, amount, userId);
    
    this._currentRound.addPrediction(prediction);
    
    return prediction;
  }

  /**
   * 現在のラウンドを取得
   */
  getCurrentRound(): GameRound {
    if (!this._currentRound) {
      this.startNewRound();
    }
    return this._currentRound!;
  }

  /**
   * 結果を取得
   */
  getResults(): GameResult[] {
    return [...this._results];
  }

  /**
   * 結果の購読
   */
  subscribeToResults(callback: (result: GameResult) => void): () => void {
    this._subscribers.push(callback);
    
    // 購読解除関数を返す
    return () => {
      const index = this._subscribers.indexOf(callback);
      if (index !== -1) {
        this._subscribers.splice(index, 1);
      }
    };
  }

  /**
   * ゲームサイクルを開始
   */
  private startGameCycle(): void {
    if (this._intervalId !== null) {
      return;
    }

    // 最初のラウンドを開始
    this.startNewRound();

    // 定期的にラウンドを終了し、新しいラウンドを開始
    this._intervalId = window.setInterval(() => {
      this.endCurrentRound();
      
      // 次のラウンドまでの間隔を空ける
      setTimeout(() => {
        this.startNewRound();
      }, this._roundIntervalMs);
    }, this._roundDurationMs + this._roundIntervalMs);
  }

  /**
   * 新しいラウンドを開始
   */
  private startNewRound(): void {
    const currentPrice = this._chartService.getCurrentPrice();
    const startTime = Date.now();
    this._currentRound = new GameRound(startTime, this._roundDurationMs, currentPrice);
  }

  /**
   * 現在のラウンドを終了
   */
  private endCurrentRound(): void {
    if (!this._currentRound) return;

    // ラウンドを閉じる
    this._currentRound.close();

    // 最終価格を取得
    const currentPrice = this._chartService.getCurrentPrice();

    // 各予測に対して結果を生成
    for (const prediction of this._currentRound.predictions) {
      const result = new GameResult(
        prediction,
        this._currentRound.startPrice,
        currentPrice
      );

      // 勝利した場合は報酬を計算
      if (result.status === 'win') {
        const reward = prediction.amount * this._winMultiplier;
        result.setReward(reward);
      }

      // 結果を保存
      this._results.push(result);

      // 購読者に通知
      this.notifySubscribers(result);
    }
  }

  /**
   * 購読者に通知
   */
  private notifySubscribers(result: GameResult): void {
    for (const subscriber of this._subscribers) {
      subscriber(result);
    }
  }

  /**
   * ゲームサイクルを停止
   */
  stopGameCycle(): void {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  /**
   * ラウンド時間を設定
   */
  setRoundDuration(durationMs: number): void {
    this._roundDurationMs = durationMs;
    
    // ゲームサイクルを再開
    this.stopGameCycle();
    this.startGameCycle();
  }

  /**
   * 勝利時の配当倍率を設定
   */
  setWinMultiplier(multiplier: number): void {
    this._winMultiplier = multiplier;
  }
}
