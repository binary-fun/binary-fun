import { ChartData } from '../models/ChartData.tsx';
import type { ChartDataPoint } from '../models/ChartData.tsx';

/**
 * Interface for chart service
 * Interface Segregation Principle: Don't force clients to depend on methods they don't use
 */
export interface IChartService {
  getCurrentData(): ChartData;
  generateNextDataPoint(): ChartDataPoint;
  getHistoricalData(minutes: number): ChartData;
  subscribeToUpdates(callback: (data: ChartData) => void): () => void;
  getCurrentPrice(): number;
  markPredictionPoint(direction?: 'up' | 'down'): number;
}

/**
 * Service for generating and managing chart data
 * Single Responsibility Principle: Only responsible for chart data generation and management
 */
export class ChartService implements IChartService {
  private _chartData: ChartData;
  private _subscribers: ((data: ChartData) => void)[];
  private _updateInterval: number;
  private _intervalId: number | null;
  private _volatility: number;
  private _trend: number;
  private _lastPrice: number;
  private _fixedTimeStep: number; // Fixed time step in milliseconds

  constructor(
    initialPrice: number = 150, // Solana price around $150
    updateInterval: number = 1000,
    volatility: number = 0.01,
    trend: number = 0,
    maxDataPoints: number = 180 // Keep 180 data points (3 minutes at 1 second interval)
  ) {
    this._chartData = new ChartData([], maxDataPoints);
    this._subscribers = [];
    this._updateInterval = updateInterval;
    this._volatility = volatility;
    this._trend = trend;
    this._lastPrice = initialPrice;
    this._intervalId = null;
    this._fixedTimeStep = updateInterval; // Time step matches update interval

    // Add initial data points to fill the chart
    const now = Date.now();
    for (let i = maxDataPoints - 1; i >= 0; i--) {
      // Generate historical data with realistic price movements
      const timestamp = now - (i * this._fixedTimeStep);
      const randomFactor = 1 + (Math.random() * 0.02 - 0.01); // ±1% variation
      const price = initialPrice * randomFactor;
      
      const dataPoint: ChartDataPoint = {
        timestamp,
        price,
      };
      
      this._chartData.addDataPoint(dataPoint);
      this._lastPrice = price;
    }

    // Start automatic updates
    this.startUpdates();
  }

  /**
   * Get current chart data
   */
  getCurrentData(): ChartData {
    return this._chartData;
  }

  /**
   * Generate next data point
   */
  generateNextDataPoint(): ChartDataPoint {
    const lastPoint = this._chartData.getLatestPoint();
    const timestamp = lastPoint ? lastPoint.timestamp + this._fixedTimeStep : Date.now();
    
    // Generate random price movement based on Brownian motion
    const randomChange = this._lastPrice * this._volatility * (Math.random() * 2 - 1);
    const trendChange = this._lastPrice * this._trend;
    const newPrice = Math.max(0.01, this._lastPrice + randomChange + trendChange);
    
    this._lastPrice = newPrice;
    
    const dataPoint: ChartDataPoint = {
      timestamp,
      price: newPrice,
    };
    
    this._chartData.addDataPoint(dataPoint);
    this.notifySubscribers();
    
    return dataPoint;
  }

  /**
   * Get historical chart data
   */
  getHistoricalData(minutes: number): ChartData {
    const now = Date.now();
    const startTime = now - minutes * 60 * 1000;
    const historicalPoints = this._chartData.getDataInRange(startTime, now);
    return new ChartData(historicalPoints);
  }

  /**
   * Subscribe to updates
   */
  subscribeToUpdates(callback: (data: ChartData) => void): () => void {
    this._subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this._subscribers.indexOf(callback);
      if (index !== -1) {
        this._subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Start automatic updates
   */
  private startUpdates(): void {
    if (this._intervalId !== null) {
      return;
    }
    
    this._intervalId = window.setInterval(() => {
      this.generateNextDataPoint();
    }, this._updateInterval);
  }

  /**
   * Stop automatic updates
   */
  stopUpdates(): void {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  /**
   * Notify subscribers
   */
  private notifySubscribers(): void {
    for (const subscriber of this._subscribers) {
      subscriber(this._chartData);
    }
  }

  /**
   * Set update interval
   */
  setUpdateInterval(interval: number): void {
    this._updateInterval = interval;
    this._fixedTimeStep = interval;
    
    // Restart updates
    this.stopUpdates();
    this.startUpdates();
  }

  /**
   * Set volatility
   */
  setVolatility(volatility: number): void {
    this._volatility = volatility;
  }

  /**
   * Set trend
   */
  setTrend(trend: number): void {
    this._trend = trend;
  }

  /**
   * Get current price
   */
  getCurrentPrice(): number {
    // チャートの75%位置のデータポイントを取得
    const dataPoints = this._chartData.data;
    const visibleDataPoints = Math.floor(dataPoints.length * 0.75);
    const currentPoint = dataPoints[visibleDataPoints - 1];
    
    if (currentPoint) {
      return currentPoint.price;
    }
    
    const latestPoint = this._chartData.getLatestPoint();
    return latestPoint ? latestPoint.price : this._lastPrice;
  }

  /**
   * Mark prediction point
   * This adds a marker to the chart data at the current price point
   * and returns the current price for reference
   */
  markPredictionPoint(direction?: 'up' | 'down'): number {
    // チャートの75%位置のデータポイントを取得
    const dataPoints = this._chartData.data;
    const visibleDataPoints = Math.floor(dataPoints.length * 0.75);
    const currentPoint = dataPoints[visibleDataPoints - 1];
    const latestPoint = this._chartData.getLatestPoint();
    
    // Mark the current point as a prediction point
    if (currentPoint) {
      // 以前のハイライトをクリア
      for (const point of dataPoints) {
        (point as any).highlight = false;
        (point as any).isPredictionPoint = false;
      }
      
      // Add a highlight property to the current point (75% position)
      (currentPoint as any).highlight = true;
      (currentPoint as any).isPredictionPoint = true;
      (currentPoint as any).direction = direction || 'up'; // デフォルトは上向き
      
      // Notify subscribers about the change
      this.notifySubscribers();
      
      // 現在の正確な価格を返す
      return currentPoint.price;
    }
    
    return latestPoint ? latestPoint.price : this._lastPrice;
  }
}
