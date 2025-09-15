import React, { useState } from 'react';
import type { Slide, Palette, RealWorldImage } from '../types';

interface AssetLibraryModalProps {
  slide: Slide;
  palette: Palette;
  realWorldImages: RealWorldImage[];
  onClose: () => void;
  onRegenerate: (newVisualDescription: string) => void;
}

const MATERIALS = ['Crystalline', 'Obsidian', 'Liquid Chrome', 'Frosted Glass', 'Polished Marble', 'Holographic Mesh'];
const LIGHTING_STYLES = ['Dramatic High-Contrast', 'Soft & Serene', 'Cinematic', 'Volumetric', 'Studio Lighting'];

const parseVisualDescription = (description: string): { concept: string, material: string, lighting: string } => {
    const parts = description.split('.').map(p => p.trim());
    const concept = parts[0] || description;
    
    let material = MATERIALS[0];
    for (const m of MATERIALS) {
        if (description.toLowerCase().includes(m.toLowerCase())) {
            material = m;
            break;
        }
    }

    let lighting = LIGHTING_STYLES[0];
    for (const l of LIGHTING_STYLES) {
        if (description.toLowerCase().includes(l.toLowerCase())) {
            lighting = l;
            break;
        }
    }
    
    return { concept, material, lighting };
};

const GenerateAbstractTab: React.FC<Pick<AssetLibraryModalProps, 'slide' | 'onRegenerate'>> = ({ slide, onRegenerate }) => {
  const initialState = parseVisualDescription(slide.visualDescription);
  const [concept, setConcept] = useState(initialState.concept);
  const [material, setMaterial] = useState(initialState.material);
  const [lighting, setLighting] = useState(initialState.lighting);

  const handleRegenerate = () => {
    const newDescription = `${concept}. A metaphorical representation using a ${material} texture with ${lighting} lighting.`;
    onRegenerate(newDescription);
  };
  
  return (
    <div className="p-8 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="concept" className="block text-sm font-bold text-gray-300 mb-2">Metaphorical Concept</label>
          <textarea
            id="concept"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-[#121212] border-2 border-transparent focus:border-[#BB86FC] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-0 transition-colors duration-300"
          />
        </div>
        <div>
          <label htmlFor="material" className="block text-sm font-bold text-gray-300 mb-2">Primary Material</label>
          <select id="material" value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full px-4 py-3 bg-[#121212] border-2 border-transparent focus:border-[#BB86FC] rounded-lg text-white focus:outline-none focus:ring-0 transition-colors duration-300">
            {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="lighting" className="block text-sm font-bold text-gray-300 mb-2">Lighting Style</label>
          <select id="lighting" value={lighting} onChange={(e) => setLighting(e.target.value)} className="w-full px-4 py-3 bg-[#121212] border-2 border-transparent focus:border-[#BB86FC] rounded-lg text-white focus:outline-none focus:ring-0 transition-colors duration-300">
            {LIGHTING_STYLES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button onClick={handleRegenerate} className="w-full px-6 py-3 bg-[#03DAC6] text-[#121212] font-bold rounded-lg uppercase tracking-wider hover:bg-[#23e0cf] focus:outline-none focus:ring-4 focus:ring-[#03DAC6]/50 transition-all duration-300">
          Regenerate Image
        </button>
      </div>
    </div>
  );
};

const FindRealImageTab: React.FC<{ images: RealWorldImage[] }> = ({ images }) => {

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, image: RealWorldImage) => {
    e.dataTransfer.setData('application/json', JSON.stringify(image));
  };
  
  return (
    <div className="p-8">
        <p className="text-sm text-gray-400 mb-4">Drag an image from the tray and drop it onto your slide to set it as the background. A citation will be added automatically.</p>
        {images.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
                <p>No real-world images were found for this story.</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                {images.map((image, index) => {
                    return (
                        <div 
                            key={index}
                            draggable
                            onDragStart={(e) => handleDragStart(e, image)}
                            className="aspect-square bg-gray-700 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing group relative"
                            title={`Source: ${image.source}`}
                        >
                            <img 
                                src={image.url}
                                alt={`Source: ${image.source}`} 
                                className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-white text-xs truncate">{image.source}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );
};

export const AssetLibraryModal: React.FC<AssetLibraryModalProps> = ({ slide, palette, realWorldImages, onClose, onRegenerate }) => {
  const [activeTab, setActiveTab] = useState<'abstract' | 'real'>('abstract');

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#333333] rounded-2xl shadow-xl w-full max-w-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold uppercase text-white">Asset Library</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </header>

        <div className="flex border-b border-gray-700">
          <button 
            onClick={() => setActiveTab('abstract')} 
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'abstract' ? 'bg-[#444] text-[#BB86FC]' : 'text-gray-400 hover:bg-[#3a3a3a]'}`}
          >
            Generate Abstract
          </button>
          <button 
            onClick={() => setActiveTab('real')} 
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'real' ? 'bg-[#444] text-[#BB86FC]' : 'text-gray-400 hover:bg-[#3a3a3a]'}`}
          >
            Find Real Image
          </button>
        </div>

        <div>
          {activeTab === 'abstract' && <GenerateAbstractTab slide={slide} onRegenerate={onRegenerate} />}
          {activeTab === 'real' && <FindRealImageTab images={realWorldImages} />}
        </div>
      </div>
    </div>
  );
};
