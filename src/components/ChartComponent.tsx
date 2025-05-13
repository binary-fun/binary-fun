import React, { useEffect, useState, useRef } from 'react';
import type { ChartDataPoint } from '../models/ChartData.tsx';

// チャートコンポーネント
interface ChartComponentProps {
  predictionPrice?: number | null;
  predictionDirection?: 'up' | 'down' | null;
  remainingTime?: number;
  chartService: any;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ predictionPrice, predictionDirection = null, remainingTime = 60, chartService }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });
  
  useEffect(() => {
    // 初期データを設定
    setChartData(chartService.getCurrentData().data);
    
    // チャートデータの更新をサブスクライブ
    const unsubscribe = chartService.subscribeToUpdates((data: any) => {
      setChartData(data.data);
    });
    
    // コンポーネントのアンマウント時にサブスクリプションを解除
    return () => {
      unsubscribe();
    };
  }, [chartService]);
  
  useEffect(() => {
    // ウィンドウのリサイズイベントを処理
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        // 親要素の幅から価格ラベル用のスペースを引く
        const parentWidth = canvasRef.current.parentElement.clientWidth;
        const chartWidth = parentWidth - 60; // 左側の価格ラベル用に60px確保
        
        setDimensions({
          width: chartWidth,
          height: 400
        });
      }
    };
    
    // 初期サイズを設定
    handleResize();
    
    // リサイズイベントリスナーを追加
    window.addEventListener('resize', handleResize);
    
    // コンポーネントのアンマウント時にイベントリスナーを削除
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  useEffect(() => {
    if (!canvasRef.current || chartData.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    
    // チャートの描画
    const drawChart = () => {
      if (!ctx) return;
      
      // 背景を描画
      ctx.fillStyle = '#0c0b16';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      
      // チャートの描画領域を設定（マージンを確保）
      const margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 10
      };
      
      const chartWidth = dimensions.width - margin.left - margin.right;
      const chartHeight = dimensions.height - margin.top - margin.bottom;
      
      // 現在時刻から1分後が一番右になるように調整
      // 現在のデータポイントを左側75%に表示し、右側25%を未来用に空ける
      const visibleDataPoints = Math.floor(chartData.length * 0.75);
      const visibleData = chartData.slice(0, visibleDataPoints);
      
      // 未来部分（右側25%）を空白にする
      const futureWidth = chartWidth * 0.25;
      
      // 現在時刻のX座標（チャートの75%位置）
      const currentTimeX = margin.left + chartWidth * 0.75;
      
      // グリッドを描画
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 0.5;
      
      // 水平グリッド線
      for (let i = 0; i <= 5; i++) {
        const y = i * (dimensions.height / 5);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(dimensions.width, y);
        ctx.stroke();
      }
      
      // 垂直グリッド線
      for (let i = 0; i <= 10; i++) {
        const x = i * (dimensions.width / 10);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.height);
        ctx.stroke();
      }
      
      // データがない場合は終了
      if (chartData.length === 0) return;
      
      // 価格の最大値と最小値を計算
      const prices = chartData.map(d => d.price);
      const maxPrice = Math.max(...prices) * 1.01;
      const minPrice = Math.min(...prices) * 0.99;
      const priceRange = maxPrice - minPrice;
      
      // 価格をY座標に変換する関数
      const priceToY = (price: number) => {
        return margin.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
      };
      
      // 時間をX座標に変換する関数
      const timeToX = (time: number, index: number) => {
        if (visibleData.length < 2) return margin.left;
        const timeRange = visibleData[visibleData.length - 1].timestamp - visibleData[0].timestamp;
        // 現在時刻が右側75%の位置に表示されるように調整
        return margin.left + ((time - visibleData[0].timestamp) / timeRange) * (chartWidth * 0.75);
      };
      
      // チャートラインを描画
      ctx.strokeStyle = '#00FFA3'; // Solanaグリーン
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      visibleData.forEach((data, index) => {
        const x = timeToX(data.timestamp, index);
        const y = priceToY(data.price);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      // データポイントを描画
      visibleData.forEach((data, index) => {
        const x = timeToX(data.timestamp, index);
        const y = priceToY(data.price);
        
        // 上昇/下降ポイントを強調表示
        if ((data as any).highlight) {
          ctx.fillStyle = '#FFA500'; // オレンジ色に統一
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      // チャート内の価格表示は削除（外部に表示するため）
      
      // チャート内の時間ラベルと価格ラベルは削除（外部に表示するため）
      
      // 予測価格を表示
      if (predictionPrice) {
        const y = priceToY(predictionPrice);
        const currentPrice = chartData[chartData.length - 1].price;
        
        // 水平線を描画
        ctx.beginPath();
        ctx.setLineDash([5, 3]);
        ctx.strokeStyle = '#FFA500'; // オレンジ色に統一
        ctx.lineWidth = 2;
        ctx.moveTo(0, y);
        ctx.lineTo(dimensions.width, y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // 予測価格ラベルを表示
        ctx.fillStyle = '#FFA500'; // オレンジ色に統一
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Prediction: $${predictionPrice.toFixed(2)}`, 10, y - 10);
        
        // 未来部分に予測方向を表示
        if (predictionDirection) {
          // 現在時刻から未来部分へ向かう矢印を描画
          const startX = currentTimeX;
          const startY = priceToY(currentPrice);
          const endX = dimensions.width - margin.right;
          const endY = predictionDirection === 'up' 
            ? startY - chartHeight * 0.15 // 上向き
            : startY + chartHeight * 0.15; // 下向き
          
          // グラデーションを作成
          const gradient = ctx.createLinearGradient(startX, 0, endX, 0);
          // オレンジ色のグラデーションに統一
          gradient.addColorStop(0, 'rgba(255, 165, 0, 0.1)');
          gradient.addColorStop(1, 'rgba(255, 165, 0, 0.5)');
          
          // 予測エリアを塗りつぶし
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.lineTo(endX, dimensions.height);
          ctx.lineTo(startX, dimensions.height);
          ctx.closePath();
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // 予測線を描画
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = '#FFA500'; // オレンジ色に統一
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // 矢印の先端を描画
          const arrowSize = 10;
          ctx.beginPath();
          if (predictionDirection === 'up') {
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - arrowSize, endY + arrowSize);
            ctx.lineTo(endX - arrowSize / 2, endY);
            ctx.lineTo(endX - arrowSize, endY - arrowSize);
          } else {
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - arrowSize, endY - arrowSize);
            ctx.lineTo(endX - arrowSize / 2, endY);
            ctx.lineTo(endX - arrowSize, endY + arrowSize);
          }
          ctx.closePath();
          ctx.fillStyle = '#FFA500'; // オレンジ色に統一
          ctx.fill();
        }
      }
    };
    
    drawChart();
  }, [chartData, dimensions, predictionPrice]);
  
  // 現在の価格を取得（チャートの75%位置の価格）
  const getCurrentPrice = () => {
    if (chartData.length === 0) return 0;
    // チャートの75%位置のデータポイントの価格を返す
    const visibleDataPoints = Math.floor(chartData.length * 0.75);
    return chartData[visibleDataPoints - 1]?.price || chartData[chartData.length - 1].price;
  };
  
  // 時間ラベルを生成
  const getTimeLabels = () => {
    if (chartData.length === 0) return [];
    
    const labels = [];
    const latestTime = chartData[chartData.length - 1].timestamp;
    const oldestTime = chartData[0].timestamp;
    const timeRange = latestTime - oldestTime;
    
    // 1分（60000ミリ秒）
    const oneMinute = 60000;
    
    // 6つの時間ラベルを表示（0から5）
    for (let i = 0; i <= 5; i++) {
      let timestamp: number;
      let index = -1;
      
      if (i <= 4) {
        // 0%から75%の範囲に過去のデータの時間を均等に配置
        // 0, 1, 2, 3, 4 -> 0%, 18.75%, 37.5%, 56.25%, 75%
        const ratio = i / 4 * 0.75;
        timestamp = latestTime - (1 - (i / 4)) * timeRange;
        
        // 対応するインデックスを見つける（表示用）
        const closestIndex = chartData.findIndex(point => 
          Math.abs(point.timestamp - timestamp) === Math.min(...chartData.map(p => Math.abs(p.timestamp - timestamp)))
        );
        index = closestIndex >= 0 ? closestIndex : -1;
      } else {
        // 100%の位置（右端）に現在時刻から1分後の時間を表示
        timestamp = latestTime + oneMinute;
        index = -1; // 未来のデータなのでインデックスはなし
      }
      
      const time = new Date(timestamp);
      const timeStr = `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
      labels.push({ index, time: timeStr });
    }
    
    return labels;
  };
  
  // 価格ラベルを生成
  const getPriceLabels = () => {
    if (chartData.length === 0) return [];
    
    const prices = chartData.map(d => d.price);
    const maxPrice = Math.max(...prices) * 1.01;
    const minPrice = Math.min(...prices) * 0.99;
    const priceRange = maxPrice - minPrice;
    
    const labels = [];
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (i / 5) * priceRange;
      labels.push(price);
    }
    return labels;
  };
  
  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold text-lg">Binary.fun Price Chart</div>
        <div className="text-xl font-bold text-solana-green">${getCurrentPrice().toFixed(2)}</div>
      </div>
      
      <div className="flex">
        {/* 価格ラベル（左側） */}
        <div className="flex flex-col justify-between pr-2 py-2 text-right text-xs text-gray-400">
          {getPriceLabels().reverse().map((price, index) => (
            <div key={index}>${price.toFixed(2)}</div>
          ))}
        </div>
        
        {/* チャート */}
        <div className="flex-1">
          <canvas 
            ref={canvasRef} 
            width={dimensions.width} 
            height={dimensions.height}
            className="chart-canvas rounded-lg"
          />
        </div>
      </div>
      
      {/* 時間ラベル（下側） */}
      <div className="flex justify-between mt-1 text-xs text-gray-400">
        {getTimeLabels().map((label, index) => (
          <div key={index}>{label.time}</div>
        ))}
      </div>
    </div>
  );
};

export default ChartComponent;
