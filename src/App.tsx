
import { useState, useEffect } from 'react'
import Header from './components/Header'
import HeroAction from './components/HeroAction'
import SelectionGrid from './components/SelectionGrid'
import { useFileSelection } from './hooks/useFileSelection'
import { useImageProcessor } from './hooks/useImageProcessor'
import type { IDType } from './data/mockData'

function App() {
  const { selectedFile, handleFileSelect, clearSelection } = useFileSelection();
  const {
    isProcessing,
    displaySrc,
    displayState,
    processBackground,
    processCrop,
    reset
  } = useImageProcessor(selectedFile?.previewUrl || null);

  const [backgroundColor, setBackgroundColor] = useState<string>('transparent');

  // Reset processor when file changes (handled by key/useEffect logic usually, or hook dependency)
  // Hook depends on selectedFile.previewUrl, but we should reset BG color too.
  useEffect(() => {
    if (!selectedFile) {
      setBackgroundColor('transparent');
    }
  }, [selectedFile]);


  // Handlers
  const handleColorClick = async (color: string) => {
    await processBackground();
    setBackgroundColor(color);
  };

  const handleSizeSelect = async (item: IDType) => {
    // If no file selected, maybe prompt upload? 
    // For now, assume this only works if file is present OR we implement "Select size -> Upload" flow later.
    // But user said: "Upload -> Appear photo -> Select function".
    if (selectedFile) {
      await processCrop(item.width, item.height);
      // Auto switch to white/blue bg if needed? Let's keep current or transparent.
      // Usually ID photos need a color. Default to Blue if transparent?
      if (backgroundColor === 'transparent') {
        setBackgroundColor('#3b82f6');
      }
    } else {
      alert("请先上传照片");
    }
  };

  const handleSave = () => {
    if (!displaySrc) return;
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = displaySrc;
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (backgroundColor !== 'transparent') {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);

        const link = document.createElement('a');
        link.download = `id-photo-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto shadow-2xl overflow-hidden relative font-sans flex flex-col">
      <Header />

      {/* Content Area */}
      <div className="flex-1 relative z-10 flex flex-col">

        {/* Dynamic Top Section: either Upload Hero OR Image Preview */}
        {!selectedFile ? (
          <>
            <HeroAction onFileSelect={handleFileSelect} />
            {/* Quick Tool Icons Row (Home Only) */}
            <div className="px-6 mb-8 grid grid-cols-4 gap-2">
              {['一键换底', '智能正装', '定制证件', '回执办理'].map((tool, i) => (
                <div key={i} className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1 shadow-sm ${i === 0 ? 'bg-blue-50 text-blue-600' :
                    i === 1 ? 'bg-purple-50 text-purple-600' :
                      i === 2 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                    }`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <span className="text-xs text-text-secondary font-medium">{tool}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="px-6 py-4 flex flex-col items-center animate-in fade-in slide-in-from-bottom-5">
            {/* Re-implementing the "Canvas" feel but inline */}
            <div className="relative shadow-xl rounded-lg overflow-hidden border-4 border-white ring-1 ring-gray-100 max-h-[50vh] transition-all">
              {/* BG Layer */}
              <div
                className="absolute inset-0 transition-colors duration-300"
                style={{ backgroundColor: backgroundColor }}
              />

              {/* Image Layer */}
              <img
                src={displaySrc || selectedFile.previewUrl}
                alt="Preview"
                className="relative z-10 block w-auto h-auto max-h-[50vh] object-contain"
              />

              {/* Loading Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                </div>
              )}
            </div>

            {/* Inline Toolbar for Color */}
            <div className="mt-6 w-full overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex justify-center gap-4">
                {[
                  { color: '#3b82f6', name: '蓝底' },
                  { color: '#ffffff', name: '白底', border: true },
                  { color: '#ef4444', name: '红底' },
                  { color: '#60a5fa', name: '浅蓝' },
                  { color: 'transparent', name: '透明', icon: true }
                ].map((c) => (
                  <div className="flex flex-col items-center gap-1 min-w-[3rem]" key={c.name}>
                    <div
                      className={`w-10 h-10 rounded-full cursor-pointer transition-all active:scale-95 shadow-sm relative flex items-center justify-center ${backgroundColor === c.color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''} ${c.border ? 'border border-gray-200' : ''}`}
                      style={{ backgroundColor: c.color === 'transparent' ? undefined : c.color }}
                      onClick={() => handleColorClick(c.color)}
                    >
                      {c.color === 'transparent' && (
                        <div className="w-full h-full rounded-full bg-[repeating-conic-gradient(#e5e7eb_0%_25%,#fff_0%_50%)] bg-[length:6px_6px]" />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex gap-4 mt-4 w-full">
              <button onClick={clearSelection} className="flex-1 py-2.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl active:scale-95 transition-transform">
                重新上传
              </button>
              <button
                onClick={handleSave}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform disabled:opacity-50"
              >
                保存照片
              </button>
            </div>
          </div>
        )}

        {/* Divider if needed */}
        <div className="h-4"></div>

        {/* Selection Grid (Always Visible) 
            When file is selected, clicking these items triggers Crop.
        */}
        <SelectionGrid onSelect={handleSizeSelect} />

      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-100 flex justify-around py-3 pb-6 shrink-0 z-50">
        <div className="flex flex-col items-center text-primary-start cursor-pointer">
          <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
          <span className="text-[10px] font-bold">首页</span>
        </div>
        <div className="flex flex-col items-center text-gray-400 cursor-pointer hover:text-primary-start transition-colors">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          <span className="text-[10px]">订单</span>
        </div>
        <div className="flex flex-col items-center text-gray-400 cursor-pointer hover:text-primary-start transition-colors">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px]">我的</span>
        </div>
      </div>
    </div>
  )
}

export default App
