import React, { useState, useEffect, useRef } from 'react';

interface PromptModalProps {
  title: string;
  message: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({ title, message, onConfirm, onCancel }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onConfirm(inputValue.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-[#333333] rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-4">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-gray-400">{message}</p>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-4 py-3 bg-[#121212] border-2 border-transparent focus:border-[#BB86FC] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-0 transition-all duration-300"
              placeholder="e.g., A robot holding a red skateboard"
            />
          </div>
          <div className="flex justify-end gap-4 p-4 bg-[#1E1E1E] rounded-b-2xl">
            <button type="button" onClick={onCancel} className="px-6 py-2 font-bold rounded-lg hover:bg-gray-600/50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-[#BB86FC] text-[#121212] font-bold rounded-lg hover:bg-[#a16bea] transition-colors">
              Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
