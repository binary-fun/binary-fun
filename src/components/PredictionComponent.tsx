import React, { useEffect, useState } from 'react';
import type { PredictionDirection } from '../models/Prediction.tsx';

// Prediction Component
interface PredictionProps {
  onPrediction: (direction: PredictionDirection, amount: number) => void;
  disabled?: boolean;
  remainingTime: number;
}

const PredictionComponent: React.FC<PredictionProps> = ({ onPrediction, disabled = false, remainingTime }) => {
  const [amount, setAmount] = useState(500);
  const [error, setError] = useState('');
  const [isPredictionMade, setIsPredictionMade] = useState(false);
  const [predictionDirection, setPredictionDirection] = useState<PredictionDirection | null>(null);
  
  // Preset amounts
  const presetAmounts = [100, 500, 1000, 5000, 10000];
  // Step amount (for +/- buttons)
  const stepAmount = 100;
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters
    const cleanValue = e.target.value.replace(/[^\d]/g, '');
    const value = parseInt(cleanValue, 10);
    
    if (isNaN(value)) {
      setAmount(500);
    } else if (value < 100) {
      setAmount(100);
    } else if (value > 10000) {
      setAmount(10000);
    } else {
      setAmount(value);
    }
  };
  
  // Function to adjust amount
  const adjustAmount = (delta: number) => {
    let newAmount = amount + delta;
    
    if (newAmount < 100) {
      newAmount = 100;
    } else if (newAmount > 10000) {
      newAmount = 10000;
    }
    
    setAmount(newAmount);
  };
  
  // Function to format amount
  const formatAmount = (value: number) => {
    return value.toLocaleString('en-US');
  };
  
  const handlePrediction = (direction: PredictionDirection) => {
    if (disabled) return;
    
    try {
      onPrediction(direction, amount);
      setError('');
      setIsPredictionMade(true);
      setPredictionDirection(direction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed');
      setTimeout(() => setError(''), 3000);
    }
  };
  
  // Reset prediction state when countdown ends
  useEffect(() => {
    if (remainingTime === 60) {
      setIsPredictionMade(false);
    }
  }, [remainingTime]);
  
  // Format remaining time in minutes:seconds format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex flex-col items-center h-[250px] justify-center">
      {!isPredictionMade ? (
        <>
          {/* Amount input field and +/- buttons */}
          <div className="flex items-center space-x-2 w-full max-w-xs justify-center">
            <button
              onClick={() => adjustAmount(-stepAmount)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
              disabled={disabled}
            >
              -
            </button>
            
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">SOL</span>
              <input
                type="text"
                value={formatAmount(amount)}
                onChange={handleAmountChange}
                className="border border-gray-600 bg-gray-800 rounded-lg px-4 py-2 pl-7 pr-2 w-full text-center text-lg font-bold text-white"
                disabled={disabled}
              />
            </div>
            
            <button
              onClick={() => adjustAmount(stepAmount)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
              disabled={disabled}
            >
              +
            </button>
          </div>
          
          {/* Slider */}
          <div className="w-full max-w-xs px-1">
            <input
              type="range"
              min="100"
              max="10000"
              step={stepAmount}
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              disabled={disabled}
            />
          </div>
          
          {/* Preset amount buttons */}
          <div className="flex flex-wrap justify-center gap-2 w-full max-w-md">
            {presetAmounts.map((presetAmount) => (
              <button
                key={presetAmount}
                onClick={() => setAmount(presetAmount)}
                className={`preset-button ${amount === presetAmount ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'} text-white text-sm py-1 px-3 rounded-full transition-all duration-200`}
                disabled={disabled}
              >
                {formatAmount(presetAmount)}
              </button>
            ))}
          </div>
          
          {/* Divider - Space between Amount input and UP/DOWN buttons */}
          <div className="w-full max-w-md my-3 flex items-center">
            <div className="flex-grow h-px bg-gray-700/50"></div>
            <div className="px-2 text-xs text-gray-500">SELECT PREDICTION</div>
            <div className="flex-grow h-px bg-gray-700/50"></div>
          </div>
        </>
      ) : null}
      
      <div className="w-full">
        {isPredictionMade ? (
          // Countdown display - Improved design
          <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-800 text-white font-bold rounded-xl shadow-xl h-full flex items-center justify-center border border-indigo-400/30">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent opacity-40 transform -skew-x-12"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptMi0yaDF2MWgtMXYtMXptMiAyaDF2NGgtMXYtNHptLTIgMmgxdjJoLTF2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
            <div className="flex flex-col items-center justify-center space-y-5 z-10 p-6">
              <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-wider text-indigo-200 mb-1">TIME REMAINING</span>
                <span className="text-5xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200 animate-pulse">{formatTime(remainingTime)}</span>
              </div>
              <span className="text-sm text-indigo-200 font-medium">Waiting for result...</span>
              {predictionDirection && (
                <div className={`mt-1 px-5 py-2 rounded-lg backdrop-blur-sm ${predictionDirection === 'up' ? 'bg-green-600/80 border border-green-400/30' : 'bg-red-600/80 border border-red-400/30'} shadow-lg`}>
                  <div className="text-sm font-medium">Your prediction:</div>
                  <div className="font-bold">{predictionDirection.toUpperCase()} - {formatAmount(amount)} SOL</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Regular UP/DOWN buttons - Adjusted to same size
          <div className="grid grid-cols-2 gap-4 h-full">
            <button
              onClick={() => handlePrediction('up')}
              className={`group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-700 text-white font-bold py-4 px-10 rounded-xl shadow-lg transition-all duration-300 hover:shadow-green-500/50 hover:shadow-xl active:scale-95 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} h-24`}
              disabled={disabled}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-transparent opacity-30 transform -skew-x-12 group-hover:opacity-50"></div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                </svg>
                <span className="text-2xl font-bold tracking-wider">UP</span>
              </div>
            </button>
            
            <button
              onClick={() => handlePrediction('down')}
              className={`group relative overflow-hidden bg-gradient-to-br from-red-500 to-red-700 text-white font-bold py-4 px-10 rounded-xl shadow-lg transition-all duration-300 hover:shadow-red-500/50 hover:shadow-xl active:scale-95 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} h-24`}
              disabled={disabled}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-transparent opacity-30 transform -skew-x-12 group-hover:opacity-50"></div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="text-2xl font-bold tracking-wider">DOWN</span>
              </div>
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="error-message text-red-500 text-sm mt-2 pulse-animation">
          {error}
        </div>
      )}
    </div>
  );
};

export default PredictionComponent;
