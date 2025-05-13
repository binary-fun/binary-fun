/**
 * 予測の方向を表す型
 */
export type PredictionDirection = 'up' | 'down';

// 定数として方向を定義
export const PredictionDirections = {
  UP: 'up' as PredictionDirection,
  DOWN: 'down' as PredictionDirection,
};

/**
 * ユーザーの予測を表現するクラス
 * 単一責任の原則：予測データの管理のみを担当
 */
export class Prediction {
  private _timestamp: number;
  private _direction: PredictionDirection;
  private _amount: number;
  private _userId: string;

  constructor(
    direction: PredictionDirection,
    amount: number,
    userId: string,
    timestamp: number = Date.now()
  ) {
    this._direction = direction;
    this._amount = amount;
    this._userId = userId;
    this._timestamp = timestamp;
  }

  /**
   * 予測の方向を取得
   */
  get direction(): PredictionDirection {
    return this._direction;
  }

  /**
   * 予測金額を取得
   */
  get amount(): number {
    return this._amount;
  }

  /**
   * ユーザーIDを取得
   */
  get userId(): string {
    return this._userId;
  }

  /**
   * 予測のタイムスタンプを取得
   */
  get timestamp(): number {
    return this._timestamp;
  }

  /**
   * 予測が正しいかどうかを判定
   * @param actualDirection 実際の方向
   */
  isCorrect(actualDirection: PredictionDirection): boolean {
    return this._direction === actualDirection;
  }
}
