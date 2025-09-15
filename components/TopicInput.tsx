import React, { useState } from 'react';
import type { Palette } from '../types';

interface TopicInputProps {
  initialTopic: string;
  onSubmit: (topic: string) => void;
  isLoading: boolean;
  palettes: Palette[];
  selectedPalette: Palette;
  onPaletteChange: (palette: Palette) => void;
}

const PaletteSwatch: React.FC<{ palette: Palette, isSelected: boolean, onClick: () => void }> = ({ palette, isSelected, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded-lg transition-all duration-200 ${isSelected ? 'ring-2 ring-offset-2 ring-offset-[#333333] ring-[#BB86FC]' : 'ring-1 ring-transparent hover:ring-gray-500'}`}
    aria-label={`Select ${palette.name} theme`}
  >
    <div className="flex flex-col gap-1 w-20">
      <div className="text-xs text-center text-gray-300 truncate font-bold">{palette.name}</div>
      <div className="flex h-5 rounded overflow-hidden">
        <div style={{ backgroundColor: palette.colors.bg, width: '25%' }} />
        <div style={{ backgroundColor: palette.colors.text, width: '15%' }} />
        <div style={{ backgroundColor: palette.colors.primary, width: '25%' }} />
        <div style={{ backgroundColor: palette.colors.secondary, width: '20%' }} />
        <div style={{ backgroundColor: palette.colors.container, width: '15%' }} />
      </div>
    </div>
  </button>
);

export const TopicInput: React.FC<TopicInputProps> = ({ initialTopic, onSubmit, isLoading, palettes, selectedPalette, onPaletteChange }) => {
  const [topic, setTopic] = useState(initialTopic);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onSubmit(topic.trim());
    }
  };

  return (
    <div className="bg-[#333333] p-8 rounded-xl shadow-lg w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-8">
        
        <div>
          <label htmlFor="topic-input" className="block text-center text-lg font-bold text-gray-200 mb-2">Topic of Interest</label>
          <input
            id="topic-input"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., AI and Technology"
            className="w-full max-w-lg px-4 py-3 bg-[#121212] border-2 border-transparent focus:border-[#BB86FC] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-0 transition-all duration-300 text-center"
            disabled={isLoading}
          />
        </div>

        <div>
            <h3 className="text-center text-lg font-bold text-gray-200 mb-3">Choose a Visual Theme</h3>
            <div className="flex flex-wrap justify-center gap-4">
                {palettes.map(p => (
                    <PaletteSwatch 
                        key={p.name}
                        palette={p}
                        isSelected={p.name === selectedPalette.name}
                        onClick={() => onPaletteChange(p)}
                    />
                ))}
            </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full max-w-xs px-8 py-3 bg-[#BB86FC] text-[#121212] font-bold rounded-lg uppercase tracking-wider hover:bg-[#a16bea] focus:outline-none focus:ring-4 focus:ring-[#BB86FC]/50 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : 'Generate'}
        </button>
      </form>
    </div>
  );
};
