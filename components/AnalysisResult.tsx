import React, { useState } from 'react';
import { NoteAnalysis } from '../types';

interface AnalysisResultProps {
  result: NoteAnalysis;
  onReset: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, onReset }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-green-500';
    if (score < 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score < 30) return 'bg-green-50 border-green-200';
    if (score < 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* 风险评估卡片 */}
      <div className={`p-5 rounded-2xl border ${getScoreBg(result.riskScore)} transition-all duration-500`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 text-lg">笔记健康度诊断</h3>
          <div className={`text-2xl font-black ${getScoreColor(result.riskScore)}`}>
            风险指数: {result.riskScore}
          </div>
        </div>

        {result.violationKeywords.length > 0 ? (
          <div className="mb-4">
            <span className="text-sm font-semibold text-gray-500 block mb-2">检测到敏感/违规词：</span>
            <div className="flex flex-wrap gap-2">
              {result.violationKeywords.map((word, idx) => (
                <span key={idx} className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-md font-medium">
                  {word}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-4 text-green-600 text-sm font-medium flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            未检测到明显违规词
          </div>
        )}

        <div className="text-sm text-gray-700 bg-white/60 p-3 rounded-xl">
          <span className="font-semibold text-gray-900">专家点评：</span>
          {result.violationAnalysis}
        </div>
      </div>

      {/* 优化方案 */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
          <span className="bg-[#ff2442] text-white p-1 rounded mr-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </span>
          爆款优化方案
        </h3>

        {/* 标题 */}
        <div className="mb-6 group relative">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">优化标题 ({result.optimizedTitle.length}字)</label>
          <div className="bg-gray-50 p-4 rounded-xl text-gray-900 font-medium text-lg leading-snug border border-gray-100 group-hover:border-[#ff2442] transition-colors cursor-text">
            {result.optimizedTitle}
          </div>
          <button
            onClick={() => handleCopy(result.optimizedTitle, 'title')}
            className="absolute top-8 right-2 p-2 text-gray-400 hover:text-[#ff2442] transition-colors"
            title="复制标题"
          >
            {copiedField === 'title' ? (
                <span className="text-xs text-green-500 font-bold">已复制</span>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            )}
          </button>
        </div>

        {/* 正文 */}
        <div className="mb-6 group relative">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">优化正文</label>
          <div className="bg-gray-50 p-4 rounded-xl text-gray-800 whitespace-pre-wrap leading-relaxed border border-gray-100 group-hover:border-[#ff2442] transition-colors text-sm">
            {result.optimizedContent}
          </div>
          <button
            onClick={() => handleCopy(result.optimizedContent, 'content')}
            className="absolute top-8 right-2 p-2 text-gray-400 hover:text-[#ff2442] transition-colors"
            title="复制正文"
          >
            {copiedField === 'content' ? (
                <span className="text-xs text-green-500 font-bold">已复制</span>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            )}
          </button>
        </div>

        {/* 标签 */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">推荐话题 ({result.recommendedTags.length}/10)</label>
          <div className="flex flex-wrap gap-2">
            {result.recommendedTags.map((tag, idx) => (
              <span key={idx} className="text-[#13386c] bg-[#f0f4ff] px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-[#dce5fa] transition-colors">
                #{tag}
              </span>
            ))}
          </div>
          <button
             onClick={() => handleCopy(result.recommendedTags.map(t => `#${t}`).join(' '), 'tags')}
             className="mt-3 text-xs text-gray-500 hover:text-[#ff2442] flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            {copiedField === 'tags' ? '已复制所有标签' : '一键复制所有标签'}
          </button>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full py-3 bg-gray-100 text-gray-600 rounded-full font-bold hover:bg-gray-200 transition-colors"
      >
        诊断下一篇笔记
      </button>
    </div>
  );
};

export default AnalysisResult;
