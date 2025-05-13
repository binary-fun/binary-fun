/**
 * Interface representing chart data point
 */
export interface ChartDataPoint {
  timestamp: number;
  price: number;
}

/**
 * Class representing a collection of chart data
 * Single Responsibility Principle: Only responsible for chart data management
 */
export class ChartData {
  private _data: ChartDataPoint[];
  private _maxDataPoints: number;

  constructor(data: ChartDataPoint[] = [], maxDataPoints: number = 0) {
    this._data = data;
    this._maxDataPoints = maxDataPoints;
  }

  /**
   * Get chart data
   */
  get data(): ChartDataPoint[] {
    return [...this._data]; // Return a copy to maintain immutability
  }

  /**
   * Add chart data point
   */
  addDataPoint(point: ChartDataPoint): void {
    this._data.push(point);
    
    // Remove oldest data points if exceeding max limit
    if (this._maxDataPoints > 0 && this._data.length > this._maxDataPoints) {
      this._data = this._data.slice(this._data.length - this._maxDataPoints);
    }
  }

  /**
   * Get data in specified time range
   */
  getDataInRange(startTime: number, endTime: number): ChartDataPoint[] {
    return this._data.filter(point => point.timestamp >= startTime && point.timestamp <= endTime);
  }

  /**
   * Get latest data point
   */
  getLatestPoint(): ChartDataPoint | null {
    if (this._data.length === 0) return null;
    return this._data[this._data.length - 1];
  }

  /**
   * Get data points around specified time
   */
  getPointsAroundTime(timestamp: number, count: number): ChartDataPoint[] {
    const index = this._data.findIndex(point => point.timestamp >= timestamp);
    if (index === -1) return [];

    const startIndex = Math.max(0, index - Math.floor(count / 2));
    const endIndex = Math.min(this._data.length - 1, startIndex + count - 1);
    
    return this._data.slice(startIndex, endIndex + 1);
  }
}
