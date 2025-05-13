import React from 'react';
import type { GameResult } from '../models/GameResult.tsx';

// 結果コンポーネント
interface ResultProps {
  results: GameResult[];
}

const ResultComponent: React.FC<ResultProps> = ({ results }) => {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 w-full shadow-xl border border-gray-700 shadow-glow">
      <h2 className="text-xl font-bold gradient-text mb-4">Recent Results</h2>
      {results.length === 0 ? (
        <div className="bg-black bg-opacity-30 rounded-lg p-6 text-gray-400 text-center min-h-[150px] flex flex-col justify-center">
          <div className="mb-2">No results yet</div>
          <div className="text-sm">Make a prediction to see results here</div>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result, index) => {
            // 結果に基づいてスタイルを決定
            const bgGradient = result.status === 'pending'
              ? 'bg-gradient-to-r from-gray-800 to-gray-700'
              : result.status === 'win'
                ? 'bg-gradient-to-r from-green-900 to-green-800'
                : 'bg-gradient-to-r from-red-900 to-red-800';
            
            const borderColor = result.status === 'pending'
              ? 'border-gray-600'
              : result.status === 'win'
                ? 'border-green-700'
                : 'border-red-700';
            
            const iconBg = result.status === 'pending'
              ? 'bg-gray-600'
              : result.status === 'win'
                ? 'bg-green-600'
                : 'bg-red-600';
            
            return (
              <div 
                key={index} 
                className={`${bgGradient} rounded-lg p-4 border ${borderColor} shadow-lg`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`${iconBg} rounded-full p-2 mr-3`}>
                      {result.prediction.direction === 'up' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-bold">
                        {result.prediction.direction === 'up' ? 'UP' : 'DOWN'}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center">
                        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 14L12 6L16 14" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8.5 11H15.5" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 17H15" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {result.prediction.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {result.status === 'pending' ? (
                      <div className="flex items-center">
                        <div className="animate-pulse mr-2 h-2 w-2 rounded-full bg-yellow-400"></div>
                        <span>Pending</span>
                      </div>
                    ) : result.status === 'win' ? (
                      <div>
                        <div className="font-bold text-green-400 flex items-center justify-end">
                          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 14L12 6L16 14" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8.5 11H15.5" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 17H15" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          +{Math.abs(Math.round(result.prediction.amount * Math.abs(result.getPriceChangePercentage()) / 100)).toLocaleString()}
                        </div>
                        <div className="text-xs text-green-500">WIN</div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-red-400 flex items-center justify-end">
                          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 14L12 6L16 14" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8.5 11H15.5" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 17H15" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          -{Math.abs(Math.round(result.prediction.amount * Math.abs(result.getPriceChangePercentage()) / 100)).toLocaleString()}
                        </div>
                        <div className="text-xs text-red-500">LOSS</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResultComponent;
