import React from 'react';
import { AnalysisHistoryItem } from '../types';

interface HistoryViewProps {
  history: AnalysisHistoryItem[];
  onSelect: (item: AnalysisHistoryItem) => void;
  onClear: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 animate-fade-in">
        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p className="text-sm">暂无优化记录</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-24">
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-bold text-gray-800">历史记录 ({history.length})</h3>
        <button onClick={onClear} className="text-xs text-gray-400 hover:text-red-500">
          清空记录
        </button>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:border-[#ff2442]/30"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-gray-800 text-sm line-clamp-1 flex-1 pr-2">
                {item.originalTitle || '无标题笔记'}
              </h4>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                item.riskScore < 30 ? 'bg-green-100 text-green-600' :
                item.riskScore < 70 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
              }`}>
                {item.riskScore}分
              </span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2 mb-3 h-8">
              {item.originalContent}
            </p>
            <div className="flex justify-between items-center text-[10px] text-gray-400">
              <span>{new Date(item.timestamp).toLocaleString()}</span>
              <span className="flex items-center text-[#ff2442]">
                查看详情
                <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
