import { Prediction } from './Prediction.tsx';
import type { PredictionDirection } from './Prediction.tsx';
import type { ChartDataPoint } from './ChartData.tsx';

/**
 * ゲーム結果のステータスを表す型
 */
export type GameResultStatus = 'win' | 'lose' | 'pending';

/**
 * ゲーム結果を表現するクラス
 * 単一責任の原則：ゲーム結果の管理のみを担当
 */
export class GameResult {
  private _prediction: Prediction;
  private _startPrice: number;
  private _endPrice: number;
  private _timestamp: number;
  private _reward: number;
  private _status: GameResultStatus;

  constructor(
    prediction: Prediction,
    startPrice: number,
    endPrice?: number,
    timestamp: number = Date.now()
  ) {
    this._prediction = prediction;
    this._startPrice = startPrice;
    this._endPrice = endPrice || startPrice;
    this._timestamp = timestamp;
    this._reward = 0;
    this._status = endPrice ? this.calculateStatus() : 'pending';
  }

  /**
   * 予測を取得
   */
  get prediction(): Prediction {
    return this._prediction;
  }

  /**
   * 開始価格を取得
   */
  get startPrice(): number {
    return this._startPrice;
  }

  /**
   * 終了価格を取得
   */
  get endPrice(): number {
    return this._endPrice;
  }

  /**
   * タイムスタンプを取得
   */
  get timestamp(): number {
    return this._timestamp;
  }

  /**
   * 報酬を取得
   */
  get reward(): number {
    return this._reward;
  }

  /**
   * ステータスを取得
   */
  get status(): GameResultStatus {
    return this._status;
  }

  /**
   * 結果を更新
   */
  updateResult(endPrice: number): void {
    this._endPrice = endPrice;
    this._status = this.calculateStatus();
  }

  /**
   * 報酬を設定
   */
  setReward(reward: number): void {
    this._reward = reward;
  }

  /**
   * 実際の方向を取得
   */
  getActualDirection(): PredictionDirection {
    if (this._endPrice > this._startPrice) {
      return 'up';
    } else if (this._endPrice < this._startPrice) {
      return 'down';
    } else {
      // 価格が変わらない場合は下がったとみなす（ルールによる）
      return 'down';
    }
  }

  /**
   * ステータスを計算
   */
  private calculateStatus(): GameResultStatus {
    const actualDirection = this.getActualDirection();
    return this._prediction.isCorrect(actualDirection) ? 'win' : 'lose';
  }

  /**
   * 価格変動率を計算
   */
  getPriceChangePercentage(): number {
    return ((this._endPrice - this._startPrice) / this._startPrice) * 100;
  }

  /**
   * 結果の文字列表現を取得
   */
  toString(): string {
    const directionStr = this._prediction.direction;
    const statusStr = this._status === 'win' ? '勝利' : this._status === 'lose' ? '敗北' : '保留中';
    const changePercent = this.getPriceChangePercentage().toFixed(2);
    
    return `予測: ${directionStr}, 結果: ${statusStr}, 変動: ${changePercent}%, 報酬: ${this._reward}`;
  }
}
