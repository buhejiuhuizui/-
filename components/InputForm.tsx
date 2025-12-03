import React from 'react';

interface InputFormProps {
  title: string;
  setTitle: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  buttonText?: string;
}

const InputForm: React.FC<InputFormProps> = ({ 
  title, 
  setTitle, 
  content, 
  setContent, 
  onSubmit, 
  isLoading,
  buttonText = '一键诊断 & 优化'
}) => {
  const isFormValid = title.trim().length > 0 && content.trim().length > 0;

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">笔记标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入标题（建议包含核心关键词）"
            className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#ff2442] focus:bg-white transition-all outline-none placeholder-gray-400 text-gray-800"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">笔记正文</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="在此粘贴你的笔记草稿..."
            className="w-full p-3 h-48 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#ff2442] focus:bg-white transition-all outline-none placeholder-gray-400 text-gray-800 resize-none"
            disabled={isLoading}
          />
          <div className="text-right text-xs text-gray-400 mt-2">
            {content.length} 字
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={!isFormValid || isLoading}
        className={`w-full py-4 rounded-full font-bold text-lg text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]
          ${!isFormValid || isLoading
            ? 'bg-gray-300 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-[#ff2442] to-[#ff5c7c] shadow-[#ff2442]/30'
          }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            专家分析中...
          </div>
        ) : (
          buttonText
        )}
      </button>

      <div className="text-center">
        <p className="text-xs text-gray-400">
          基于小红书最新算法逻辑 · 精准识别违规词 · 提升CES评分
        </p>
      </div>
    </div>
  );
};

export default InputForm;
