
import React from 'react';
import type { Story } from '../types';

interface StoryConfirmationProps {
  story: Story;
}

export const StoryConfirmation: React.FC<StoryConfirmationProps> = ({ story }) => {
  return (
    <section aria-labelledby="story-confirmation-title" className="bg-[#333333] p-8 rounded-xl shadow-lg">
      <h2 id="story-confirmation-title" className="text-2xl font-bold uppercase text-[#BB86FC] tracking-wider mb-6">
        Selected Story
      </h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{story.title}</h3>
          <a href={story.source} target="_blank" rel="noopener noreferrer" className="text-[#03DAC6] hover:underline break-all">
            {story.source}
          </a>
        </div>
        <p className="text-gray-300 leading-relaxed">{story.summary}</p>
        
        {story.groundingChunks && story.groundingChunks.length > 0 && (
          <div>
            <h4 className="font-bold text-gray-200 mt-4 mb-2">Sources Found:</h4>
            <ul className="list-disc list-inside space-y-1">
              {story.groundingChunks.map((chunk, index) => (
                <li key={index}>
                  <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-[#03DAC6]/80 hover:underline">
                    {chunk.web.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};
