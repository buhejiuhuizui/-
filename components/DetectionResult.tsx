import React from 'react';
import { NoteAnalysis } from '../types';

interface DetectionResultProps {
  result: NoteAnalysis;
  originalContent: string;
  onReset: () => void;
}

const DetectionResult: React.FC<DetectionResultProps> = ({ result, originalContent, onReset }) => {
  // Function to highlight keywords in text
  const renderHighlightedContent = () => {
    if (!result.violationKeywords || result.violationKeywords.length === 0) {
      return originalContent;
    }

    // Escape regex characters for keywords
    const keywords = result.violationKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    const parts = originalContent.split(regex);

    return parts.map((part, i) => 
      result.violationKeywords.some(k => k.toLowerCase() === part.toLowerCase()) 
        ? <span key={i} className="bg-red-100 text-[#ff2442] font-bold px-1 rounded border-b-2 border-red-200">{part}</span> 
        : part
    );
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-green-500';
    if (score < 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800 text-lg flex items-center">
            <span className="w-2 h-6 bg-[#ff2442] rounded-full mr-2"></span>
            违规检测报告
          </h3>
          <div className="flex flex-col items-end">
             <span className="text-xs text-gray-400">风险指数</span>
             <span className={`text-2xl font-black ${getScoreColor(result.riskScore)}`}>
               {result.riskScore}
             </span>
          </div>
        </div>

        {/* Highlighted Original Content */}
        <div className="mb-6">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
            原文违规词标记
          </label>
          <div className="bg-gray-50 p-4 rounded-xl text-gray-800 whitespace-pre-wrap leading-relaxed border border-gray-100 text-sm">
            {renderHighlightedContent()}
          </div>
        </div>
        
        {/* Violation Keywords List */}
        {result.violationKeywords.length > 0 && (
          <div className="mb-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              检测到的敏感词
            </label>
            <div className="flex flex-wrap gap-2">
              {result.violationKeywords.map((word, idx) => (
                <span key={idx} className="px-3 py-1 bg-red-50 text-[#ff2442] text-xs rounded-full font-medium border border-red-100">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expert Analysis */}
        <div className="bg-[#fffbf0] p-4 rounded-xl border border-[#feeebc]">
          <h4 className="font-bold text-[#b4860b] text-sm mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            专家深度解析
          </h4>
          <p className="text-sm text-[#946c00] leading-relaxed">
            {result.violationAnalysis}
          </p>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-full font-bold hover:bg-gray-50 transition-colors shadow-sm"
      >
        检测下一篇
      </button>
    </div>
  );
};

export default DetectionResult;
