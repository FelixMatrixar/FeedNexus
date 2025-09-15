import React from 'react';

interface LoaderProps {
  log: string[];
}

export const Loader: React.FC<LoaderProps> = ({ log }) => {
  return (
    <div className="flex flex-col items-center justify-center my-12 text-center bg-[#333333] p-8 rounded-xl max-w-md mx-auto">
      <div className="loader"></div>
      <div className="mt-6 text-left w-full">
        <h3 className="text-lg font-bold text-gray-200 mb-3 text-center">AI is generating your draft...</h3>
        <p className="text-center text-sm text-gray-400 mb-4">This process usually takes around 5 minutes.</p>
        <ul className="space-y-2">
            {log.map((message, index) => (
                <li key={index} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${index === log.length - 1 && message !== 'Done!' ? 'animate-pulse bg-[#03DAC6]/50' : 'bg-[#03DAC6]'}`}>
                      {message === 'Done!' ? (
                        <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-300">{message}</span>
                </li>
            ))}
        </ul>
      </div>
    </div>
  );
};