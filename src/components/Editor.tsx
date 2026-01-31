import React, { useState } from 'react';
import type { SelectedFile } from '../hooks/useFileSelection';
import { removeBackground } from '@imgly/background-removal';
import { refineEdges, smartCrop } from '../utils/imageProcessing';

interface EditorProps {
    file: SelectedFile;
    onBack: () => void;
}

interface SizeMenuProps {
    onSelectSize: (width: number, height: number) => void;
    onClose: () => void;
}

const SizeMenu: React.FC<SizeMenuProps> = ({ onSelectSize, onClose }) => {
    // Standard sizes based on 300 DPI
    const sizeCategories = [
        {
            category: "常用标准",
            sizes: [
                { label: '一寸', desc: '295x413px', width: 295, height: 413 },
                { label: '二寸', desc: '413x579px', width: 413, height: 579 },
                { label: '大一寸', desc: '390x567px', width: 390, height: 567 },
                { label: '小二寸', desc: '413x531px', width: 413, height: 531 },
            ]
        },
        {
            category: "公务/考试",
            sizes: [
                { label: '公务员', desc: '413x531px', width: 413, height: 531 },
                { label: '社保卡', desc: '358x441px', width: 358, height: 441 },
                { label: '身份证', desc: '358x441px', width: 358, height: 441 },
                { label: '驾照', desc: '260x378px', width: 260, height: 378 },
            ]
        },
        {
            category: "各国签证",
            sizes: [
                { label: '美国', desc: '51x51mm', width: 600, height: 600 },
                { label: '日本', desc: '45x45mm', width: 531, height: 531 },
                { label: '韩国', desc: '35x45mm', width: 413, height: 531 },
                { label: '欧洲', desc: '35x45mm', width: 413, height: 531 },
            ]
        }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-end z-[60] animate-in fade-in" onClick={onClose}>
            <div className="bg-white rounded-t-3xl p-5 w-full max-h-[70vh] overflow-y-auto shadow-2xl slide-in-from-bottom-10 animate-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-bold">选择证件照尺寸</h4>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-6 pb-8">
                    {sizeCategories.map((cat, idx) => (
                        <div key={idx}>
                            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pl-1">{cat.category}</h5>
                            <div className="grid grid-cols-2 gap-3">
                                {cat.sizes.map((size) => (
                                    <button
                                        key={size.label}
                                        className="p-3 border border-gray-100 bg-gray-50 rounded-xl text-left hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-95 active:bg-blue-100 group"
                                        onClick={() => onSelectSize(size.width, size.height)}
                                    >
                                        <div className="text-sm font-bold text-gray-800 group-hover:text-blue-700">{size.label}</div>
                                        <div className="text-[10px] text-gray-400 mt-0.5 group-hover:text-blue-400">{size.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Editor: React.FC<EditorProps> = ({ file, onBack }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    // Core Image Data
    const [refinedBlob, setRefinedBlob] = useState<Blob | null>(null);
    const [displaySrc, setDisplaySrc] = useState<string>(file.previewUrl);
    const [backgroundColor, setBackgroundColor] = useState<string>('transparent');

    // UI State
    const [activeTool, setActiveTool] = useState<'none' | 'color'>('none');
    const [showSizeMenu, setShowSizeMenu] = useState(false);

    // Helpers
    const ensureProcessed = async (): Promise<Blob | null> => {
        if (refinedBlob) return refinedBlob;

        setIsProcessing(true);
        try {
            console.log("Starting background removal...");
            const config: any = {
                model: 'isnet',
                output: { quality: 1.0, format: 'image/png' },
            };
            const blob = await removeBackground(file.previewUrl, config);

            // Refine
            const refined = await refineEdges(blob, 5, 1);
            setRefinedBlob(refined);

            // Only update display if not already cropped (simple logic: reset to cutout)
            const url = URL.createObjectURL(refined);
            setDisplaySrc(url);

            return refined;
        } catch (error) {
            console.error('Processing failed:', error);
            alert('处理失败，请重试');
            return null;
        } finally {
            setIsProcessing(false);
        }
    };

    const handleColorSelect = async (color: string) => {
        // Trigger Processing
        const blob = await ensureProcessed();
        if (!blob) return;

        setBackgroundColor(color);
    };

    const handleSmartCrop = async (width: number, height: number) => {
        setShowSizeMenu(false); // Close menu

        const blob = await ensureProcessed();
        if (!blob) return;

        setIsProcessing(true);
        try {
            const cropped = await smartCrop(blob, width, height);
            const url = URL.createObjectURL(cropped);
            setDisplaySrc(url);
        } catch (e) {
            console.error(e);
            alert("裁切失败");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = () => {
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
        <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-bottom-10">
            {/* 1. Header (Translucent) */}
            <div className="absolute top-0 left-0 right-0 z-20 px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/40 to-transparent">
                <button onClick={onBack} className="p-2 -ml-2 text-white rounded-full hover:bg-white/10">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="text-white font-medium text-lg drop-shadow-md">制作证件照</div>
                <button
                    onClick={handleSave}
                    className={`px-5 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all ${isProcessing ? 'opacity-50' : ''}`}
                    disabled={isProcessing}
                >
                    {isProcessing ? '处理中' : '保存'}
                </button>
            </div>

            {/* 2. Main Canvas (Dark BG for contrast) */}
            <div className="flex-1 bg-[#1a1a1a] relative overflow-hidden flex items-center justify-center p-8 pb-32">
                {/* Image Container */}
                <div className="relative shadow-2xl transition-all duration-300 ease-out"
                    style={{
                        maxHeight: '65vh',
                        maxWidth: '90vw'
                    }}
                >
                    {/* Background Layer */}
                    <div
                        className="absolute inset-0 transition-colors duration-300"
                        style={{ backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor }}
                    />

                    {/* Transparent Grid Pattern (Only visible if BG is transparent) */}
                    {backgroundColor === 'transparent' && (
                        <div className="absolute inset-0 opacity-100 z-[-1]"
                            style={{
                                backgroundImage: 'conic-gradient(#eee 0 25%, white 0 50%, #eee 0 75%, white 0)',
                                backgroundSize: '20px 20px'
                            }}
                        />
                    )}

                    {/* Image Layer */}
                    <img
                        src={displaySrc}
                        alt="Preview"
                        className="relative z-10 block w-auto h-auto max-h-[65vh] object-contain transition-all"
                    />

                    {/* Loading Overlay */}
                    {isProcessing && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in">
                            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-3"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Bottom Toolbar (Fixed) */}
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.1)] z-40">

                {/* Secondary Panel: Color Palette */}
                {activeTool === 'color' && (
                    <div className="px-6 py-4 animate-in slide-in-from-bottom-5 fade-in border-b border-gray-100">
                        <div className="flex gap-4 items-center justify-between overflow-x-auto pb-2 scrollbar-hide">
                            {[
                                { color: '#3b82f6', name: '标准蓝' },
                                { color: '#ffffff', name: '标准白', border: true },
                                { color: '#ef4444', name: '标准红' },
                                { color: '#60a5fa', name: '浅蓝' },
                                { color: '#bfdbfe', name: '淡蓝' },
                                { color: 'transparent', name: '透明', icon: true }
                            ].map((c) => (
                                <div className="flex flex-col items-center gap-2 min-w-[50px]" key={c.name}>
                                    <div
                                        className={`w-10 h-10 rounded-full cursor-pointer transition-all active:scale-90 shadow-sm relative flex items-center justify-center ${backgroundColor === c.color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''} ${c.border ? 'border border-gray-200' : ''}`}
                                        style={{ backgroundColor: c.color === 'transparent' ? undefined : c.color }}
                                        onClick={() => handleColorSelect(c.color)}
                                    >
                                        {c.color === 'transparent' && (
                                            <div className="w-full h-full rounded-full bg-[repeating-conic-gradient(#e5e7eb_0%_25%,#fff_0%_50%)] bg-[length:6px_6px]" />
                                        )}
                                    </div>
                                    <span className="text-[10px] text-gray-500 whitespace-nowrap">{c.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Primary Toolbar Icons */}
                <div className="flex justify-around items-center px-2 py-4 pb-8">

                    {/* Tool 1: Background */}
                    <button
                        onClick={() => setActiveTool(activeTool === 'color' ? 'none' : 'color')}
                        className="flex flex-col items-center gap-1 w-16 group"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeTool === 'color' ? 'bg-blue-600 text-white' : 'text-gray-600 bg-gray-100 group-hover:bg-gray-200'}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                        </div>
                        <span className={`text-[10px] font-bold ${activeTool === 'color' ? 'text-blue-600' : 'text-gray-500'}`}>换底色</span>
                    </button>

                    {/* Tool 2: Size */}
                    <button
                        onClick={() => setShowSizeMenu(true)}
                        className="flex flex-col items-center gap-1 w-16 group"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center transition-all group-hover:bg-gray-200">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">改尺寸</span>
                    </button>

                    {/* Tool 3: Beauty (Coming Soon) */}
                    <button className="flex flex-col items-center gap-1 w-16 opacity-40">
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">美颜</span>
                    </button>

                    {/* Tool 4: Edit (Coming Soon) */}
                    <button className="flex flex-col items-center gap-1 w-16 opacity-40">
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">调节</span>
                    </button>

                </div>
            </div>

            {/* Size Menu Overlay */}
            {showSizeMenu && (
                <SizeMenu
                    onSelectSize={handleSmartCrop}
                    onClose={() => setShowSizeMenu(false)}
                />
            )}
        </div>
    );
};

export default Editor;
