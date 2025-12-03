
import React, { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import DetectionResult from './components/DetectionResult';
import OptimizationResult from './components/OptimizationResult';
import HistoryView from './components/HistoryView';
import ChatModule from './components/ChatModule';
import { analyzeNote } from './services/geminiService';
import { NoteAnalysis, AppState, ModuleType, AnalysisHistoryItem } from './types';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('detect');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<NoteAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // History State
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<AnalysisHistoryItem | null>(null);

  // Load history from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('xhs_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  const saveToHistory = (analysis: NoteAnalysis, originalTitle: string, originalContent: string) => {
    const newItem: AnalysisHistoryItem = {
      ...analysis,
      id: Date.now().toString(),
      originalTitle,
      originalContent,
      timestamp: Date.now(),
    };
    const newHistory = [newItem, ...history];
    setHistory(newHistory);
    localStorage.setItem('xhs_history', JSON.stringify(newHistory));
  };

  const handleAnalyze = async () => {
    setAppState(AppState.ANALYZING);
    setErrorMsg(null);
    try {
      const data = await analyzeNote(title, content);
      setResult(data);
      saveToHistory(data, title, content);
      setAppState(AppState.SUCCESS);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
      setErrorMsg("分析失败，请检查网络或稍后重试。");
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    setTitle('');
    setContent('');
  };

  const handleModuleChange = (module: ModuleType) => {
    setActiveModule(module);
    if (module === 'history') {
      setAppState(AppState.IDLE);
      setResult(null);
    } 
    // We don't necessarily reset if switching between detect/optimize/chat to allow user to multitask
    // But for simplicity in this specific app logic (shared title/content state), we keep the form state.
    setSelectedHistoryItem(null);
  };

  const clearHistory = () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      setHistory([]);
      localStorage.removeItem('xhs_history');
    }
  };

  // Render Content Logic
  const renderMainContent = () => {
    // Chat View
    if (activeModule === 'chat') {
      return <ChatModule />;
    }

    // History Detail View
    if (activeModule === 'history' && selectedHistoryItem) {
      return (
        <div className="animate-fade-in-up">
           <button 
             onClick={() => setSelectedHistoryItem(null)}
             className="mb-4 flex items-center text-gray-500 hover:text-[#ff2442] font-medium transition-colors"
           >
             <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
             返回列表
           </button>
           <OptimizationResult 
             result={selectedHistoryItem} 
             originalTitle={selectedHistoryItem.originalTitle}
             originalContent={selectedHistoryItem.originalContent}
             isHistoryView={true}
           />
        </div>
      );
    }

    if (activeModule === 'history') {
      return <HistoryView history={history} onSelect={setSelectedHistoryItem} onClear={clearHistory} />;
    }

    // Input View (for Detect and Optimize)
    if (appState === AppState.IDLE || appState === AppState.ANALYZING || appState === AppState.ERROR) {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 bg-[#ff2442]/5 p-4 rounded-xl border border-[#ff2442]/10 flex items-start gap-3">
            <div className="text-2xl mt-0.5">
               {activeModule === 'detect' ? '🛡️' : '✨'}
            </div>
            <div>
              <h2 className="text-[#ff2442] font-bold text-base mb-1">
                {activeModule === 'detect' ? '违规与敏感词检测' : '爆款笔记优化'}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {activeModule === 'detect' 
                  ? '精准识别笔记中的违规词、限流词，并提供详细的改进建议，降低被判违规风险。'
                  : '基于小红书爆款逻辑，为您生成吸睛标题、重写正文并推荐高热度话题标签。'}
              </p>
            </div>
          </div>
          <InputForm
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            onSubmit={handleAnalyze}
            isLoading={appState === AppState.ANALYZING}
            buttonText={activeModule === 'detect' ? '开始违规检测' : '生成优化方案'}
          />
          {appState === AppState.ERROR && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 text-sm rounded-xl text-center border border-red-100 animate-pulse">
              {errorMsg}
            </div>
          )}
        </div>
      );
    }

    // Result View (Success State)
    if (appState === AppState.SUCCESS && result) {
      return (
        <div className="max-w-2xl mx-auto">
          {activeModule === 'detect' ? (
            <DetectionResult result={result} originalContent={content} onReset={handleReset} />
          ) : (
            <OptimizationResult result={result} originalTitle={title} originalContent={content} onReset={handleReset} />
          )}
        </div>
      );
    }
    
    // Fallback logic for when switching tabs while in Success state but module doesn't match
    // e.g. Analyzed in 'detect', then clicked 'optimize'.
    // We can show the same result but utilizing the OptimizationResult component.
    if (appState === AppState.SUCCESS && result && activeModule === 'optimize') {
       return <OptimizationResult result={result} originalTitle={title} originalContent={content} onReset={handleReset} />;
    }
    if (appState === AppState.SUCCESS && result && activeModule === 'detect') {
       return <DetectionResult result={result} originalContent={content} onReset={handleReset} />;
    }

    return null;
  };

  const NavItem = ({ id, label, icon, active }: { id: ModuleType, label: string, icon: React.ReactNode, active: boolean }) => (
    <button 
      onClick={() => handleModuleChange(id)}
      className={`
        group flex items-center w-full p-3 rounded-xl transition-all duration-200
        ${active 
          ? 'bg-[#ff2442] text-white shadow-lg shadow-[#ff2442]/30' 
          : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-[#ff2442]'
        }
      `}
    >
      <div className={`mr-3 ${active ? 'text-white' : 'text-gray-400 group-hover:text-[#ff2442]'}`}>
        {icon}
      </div>
      <span className="font-bold text-sm tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f8f8f8] font-sans flex flex-col md:flex-row">
      
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#fcfcfc] border-r border-gray-200 h-screen sticky top-0 p-6 z-20">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 bg-[#ff2442] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
            薯
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-800 tracking-tight">红薯管家</h1>
            <p className="text-[10px] text-gray-400 font-medium">专业运营工具箱</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem 
            id="detect" 
            label="违规检测" 
            active={activeModule === 'detect'}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <NavItem 
            id="optimize" 
            label="爆款优化" 
            active={activeModule === 'optimize'}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          />
          <NavItem 
            id="chat" 
            label="AI 助手" 
            active={activeModule === 'chat'}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
          />
          <NavItem 
            id="history" 
            label="历史记录" 
            active={activeModule === 'history'}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </nav>

        <div className="mt-auto px-2">
           <div className="p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl text-white shadow-lg">
              <p className="text-xs text-gray-400 mb-1">PRO Version</p>
              <p className="font-bold text-sm mb-2">已连接高阶算法库</p>
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full w-full bg-[#ff2442] animate-pulse"></div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#ff2442] rounded-lg flex items-center justify-center text-white font-bold text-lg">
              薯
            </div>
            <h1 className="text-xl font-black text-gray-800 tracking-tight">红薯管家</h1>
          </div>
          <div className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-500 rounded">
            Pro
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 md:bg-[#f3f4f6]">
          {renderMainContent()}
        </main>

        {/* Mobile Bottom Navigation (Hidden on Desktop) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-around items-center h-16">
            <button 
              onClick={() => handleModuleChange('detect')}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeModule === 'detect' ? 'text-[#ff2442]' : 'text-gray-400'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-[10px] font-bold">检测</span>
            </button>
            
            <button 
              onClick={() => handleModuleChange('optimize')}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeModule === 'optimize' ? 'text-[#ff2442]' : 'text-gray-400'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span className="text-[10px] font-bold">优化</span>
            </button>

            <button 
              onClick={() => handleModuleChange('chat')}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeModule === 'chat' ? 'text-[#ff2442]' : 'text-gray-400'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              <span className="text-[10px] font-bold">AI助手</span>
            </button>

            <button 
              onClick={() => handleModuleChange('history')}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeModule === 'history' ? 'text-[#ff2442]' : 'text-gray-400'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-[10px] font-bold">历史</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default App;
