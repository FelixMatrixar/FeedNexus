import React from 'react';
import { IconTextbox, IconRectangle, IconImage, IconEye, IconEyeOff, IconWand } from './icons/SlideIcons';

interface ToolboxProps {
  onAddElement: (type: 'text' | 'shape' | 'image') => void;
  isImageVisible: boolean;
  onToggleImageVisibility: () => void;
  hasImage: boolean;
  onRemoveSelectedElementBackground: () => void;
  isElementSelectedAndRemovable: boolean;
}

export const Toolbox: React.FC<ToolboxProps> = ({ 
  onAddElement, 
  isImageVisible, 
  onToggleImageVisibility, 
  hasImage,
  onRemoveSelectedElementBackground,
  isElementSelectedAndRemovable,
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 p-1.5 bg-[#1E1E1E]/80 border border-gray-700 rounded-lg backdrop-blur-sm transition-opacity duration-300">
      <button onClick={() => onAddElement('text')} className="p-2 rounded-md hover:bg-[#333333]" title="Add Textbox">
        <IconTextbox className="w-5 h-5 text-white" />
      </button>
      <button onClick={() => onAddElement('shape')} className="p-2 rounded-md hover:bg-[#333333]" title="Add Rectangle">
        <IconRectangle className="w-5 h-5 text-white" />
      </button>
      <button onClick={() => onAddElement('image')} className="p-2 rounded-md hover:bg-[#333333]" title="Generate and Add Image Element">
        <IconImage className="w-5 h-5 text-white" />
      </button>
      <div className="w-px h-5 bg-gray-600 mx-1"></div>
      <button 
        onClick={onToggleImageVisibility} 
        className="p-2 rounded-md hover:bg-[#333333] disabled:text-gray-600 disabled:cursor-not-allowed" 
        title={isImageVisible ? "Hide AI Background" : "Show AI Background"}
        disabled={!hasImage}
      >
        {isImageVisible 
            ? <IconEyeOff className="w-5 h-5 text-white" /> 
            : <IconEye className="w-5 h-5 text-white" />}
      </button>
      <button 
        onClick={onRemoveSelectedElementBackground} 
        className="p-2 rounded-md hover:bg-[#333333] disabled:text-gray-600 disabled:cursor-not-allowed" 
        title="Remove Background from Selected Image"
        disabled={!isElementSelectedAndRemovable}
      >
        <IconWand className="w-5 h-5" />
      </button>
    </div>
  );
};