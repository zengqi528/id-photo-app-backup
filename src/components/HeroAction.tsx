import React, { useRef } from 'react';
import { appStrings } from '../data/mockData';

interface HeroActionProps {
    onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const HeroAction: React.FC<HeroActionProps> = ({ onFileSelect }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="px-6 -mt-16 mb-8 relative z-10">
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileSelect}
                accept="image/*"
                className="hidden"
            />

            <div
                onClick={handleClick}
                className="bg-gradient-to-r from-primary-start to-primary-end rounded-[2rem] p-6 text-white shadow-xl flex items-center justify-between hover:scale-[1.02] transition-transform cursor-pointer active:scale-95"
            >
                <div>
                    <h2 className="text-xl font-bold mb-1">{appStrings.heroTitle}</h2>
                    <p className="text-blue-100 text-xs opacity-90">{appStrings.heroSubtitle}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mt-6 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                    type="text"
                    className="w-full bg-white text-gray-700 rounded-full py-4 pl-12 pr-4 shadow-sm border-none focus:ring-2 focus:ring-primary-start/50 outline-none"
                    placeholder={appStrings.searchPlaceholder}
                />
            </div>
        </div>
    );
};

export default HeroAction;
