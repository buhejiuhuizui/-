import React, { useState } from 'react';
import { NoteAnalysis } from '../types';

interface OptimizationResultProps {
  result: NoteAnalysis;
  originalTitle: string;
  originalContent: string;
  onReset?: () => void;
  isHistoryView?: boolean;
}

const OptimizationResult: React.FC<OptimizationResultProps> = ({ 
  result, 
  originalTitle, 
  originalContent, 
  onReset,
  isHistoryView = false
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      {/* Title Comparison */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
          <span className="bg-[#ff2442] text-white p-1 rounded mr-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </span>
          标题优化
        </h3>
        
        <div className="space-y-4">
          <div className="relative">
             <span className="absolute -left-3 top-2 w-1 h-8 bg-gray-200 rounded-r"></span>
             <p className="text-xs text-gray-400 mb-1 pl-2">原标题</p>
             <div className="bg-gray-50 p-3 rounded-lg text-gray-500 text-sm line-through decoration-gray-400">
               {originalTitle}
             </div>
          </div>
          
          <div className="relative group">
             <span className="absolute -left-3 top-2 w-1 h-8 bg-[#ff2442] rounded-r"></span>
             <p className="text-xs text-[#ff2442] font-bold mb-1 pl-2">优化后 (推荐)</p>
             <div className="bg-[#fff0f3] p-3 rounded-lg text-gray-900 font-medium text-lg border border-[#ffcad4] relative">
               {result.optimizedTitle}
               <button
                onClick={() => handleCopy(result.optimizedTitle, 'title')}
                className="absolute right-2 top-2 p-1.5 bg-white/50 rounded-full text-[#ff2442] hover:bg-white transition-colors"
               >
                 {copiedField === 'title' ? (
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                 ) : (
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                 )}
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Content Comparison */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
          <span className="bg-[#ff2442] text-white p-1 rounded mr-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </span>
          正文深度优化
        </h3>

        <div className="space-y-6">
           {/* Original Content - Collapsible or limited height could be good, but full is fine for comparison */}
           <div>
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2 border-l-2 border-gray-300">原笔记内容</span>
             </div>
             <div className="bg-gray-50 p-4 rounded-xl text-gray-500 text-sm whitespace-pre-wrap leading-relaxed border border-gray-100">
                {originalContent}
             </div>
           </div>

           {/* Optimized Content */}
           <div className="relative group">
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#ff2442] uppercase tracking-wider pl-2 border-l-2 border-[#ff2442]">优化后内容</span>
                <button
                  onClick={() => handleCopy(result.optimizedContent, 'content')}
                  className="text-xs text-[#ff2442] bg-[#fff0f3] px-2 py-1 rounded hover:bg-[#ffdee6] transition-colors flex items-center"
                >
                  {copiedField === 'content' ? '已复制' : '复制全文'}
                </button>
             </div>
             <div className="bg-white p-4 rounded-xl text-gray-800 text-sm whitespace-pre-wrap leading-relaxed border-2 border-[#ff2442]/10 shadow-[0_0_15px_rgba(255,36,66,0.05)]">
                {result.optimizedContent}
             </div>
           </div>
        </div>
      </div>

      {/* Recommended Tags */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 text-sm mb-3 uppercase tracking-wider">
           推荐爆款话题
        </h3>
        <div className="flex flex-wrap gap-2">
          {result.recommendedTags.map((tag, idx) => (
            <span key={idx} className="text-[#13386c] bg-[#f0f4ff] px-3 py-1.5 rounded-full text-sm font-medium hover:bg-[#dce5fa] transition-colors">
              #{tag}
            </span>
          ))}
        </div>
        <button
             onClick={() => handleCopy(result.recommendedTags.map(t => `#${t}`).join(' '), 'tags')}
             className="mt-4 w-full py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            {copiedField === 'tags' ? '已复制所有标签' : '一键复制所有标签'}
        </button>
      </div>

      {!isHistoryView && onReset && (
        <button
          onClick={onReset}
          className="w-full py-3 bg-gray-100 text-gray-600 rounded-full font-bold hover:bg-gray-200 transition-colors"
        >
          优化下一篇
        </button>
      )}
    </div>
  );
};

export default OptimizationResult;
