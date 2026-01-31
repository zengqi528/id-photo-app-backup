import React from 'react';
import { idTypes } from '../data/mockData';
import type { IDType } from '../data/mockData';

interface SelectionGridProps {
    onSelect?: (item: IDType) => void;
}

const SelectionGrid: React.FC<SelectionGridProps> = ({ onSelect }) => {
    return (
        <div className="px-6 pb-24">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center">
                热门尺寸
                <span className="ml-2 text-xs font-normal text-white bg-red-500 px-2 py-0.5 rounded-full">HOT</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
                {idTypes.map((item: IDType) => (
                    <div
                        key={item.id}
                        onClick={() => onSelect?.(item)}
                        className="bg-surface p-4 rounded-2xl shadow-sm border border-transparent hover:border-primary-start/30 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group active:scale-95"
                    >

                        {item.isHot && (
                            <div className="absolute top-0 right-0">
                                <span className="inline-block bg-orange-100 text-orange-600 text-[10px] px-2 py-1 rounded-bl-lg">热门</span>
                            </div>
                        )}

                        <h4 className="font-bold text-text-primary mb-1">{item.title}</h4>
                        <div className="flex justify-between items-end">
                            <p className="text-sm text-text-secondary">{item.size}</p>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-primary-start group-hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-8 text-gray-400 text-sm">
                没有更多了
            </div>
        </div>
    );
};

export default SelectionGrid;
