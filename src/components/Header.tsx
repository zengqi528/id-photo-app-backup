import React from 'react';

const Header: React.FC = () => {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-6 pt-12 pb-24 rounded-b-[2.5rem] shadow-lg text-white">
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8 8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
            </div>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        超千万<br />用户的选择
                    </h1>
                    <p className="text-blue-100 text-sm opacity-90">换底色 | 换正装 | 冲刷实体照</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-lg p-2 border border-white/30">
                    {/* Abstract ID card placeholder */}
                    <div className="w-16 h-20 bg-white/90 rounded overflow-hidden relative">
                        <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mt-4"></div>
                        <div className="w-10 h-4 bg-gray-200 mx-auto mt-1 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
