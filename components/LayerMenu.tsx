import React from 'react';
import { IconLock, IconUnlock, IconTrash, IconWand } from './icons/SlideIcons';
import type { SlideElement } from '../types';

interface LayerMenuProps {
  x: number;
  y: number;
  element: SlideElement;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onRemoveBackground: () => void;
  onClose: () => void;
}

export const LayerMenu: React.FC<LayerMenuProps> = ({ x, y, element, onBringForward, onSendBackward, onBringToFront, onSendToBack, onToggleLock, onDelete, onRemoveBackground, onClose }) => {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }}/>
      <div
        style={{ top: y, left: x }}
        className="absolute z-50 bg-[#1E1E1E] text-white rounded-md shadow-2xl py-2 w-52 border border-gray-700 text-sm"
      >
        <button onClick={onBringForward} className="w-full text-left px-4 py-2 hover:bg-[#333333] transition-colors">Bring Forward</button>
        <button onClick={onSendBackward} className="w-full text-left px-4 py-2 hover:bg-[#333333] transition-colors">Send Backward</button>
        <button onClick={onBringToFront} className="w-full text-left px-4 py-2 hover:bg-[#333333] transition-colors">Bring to Front</button>
        <button onClick={onSendToBack} className="w-full text-left px-4 py-2 hover:bg-[#333333] transition-colors">Send to Back</button>
        <div className="border-t border-gray-700 my-1" />
        <button onClick={onToggleLock} className="w-full text-left px-4 py-2 hover:bg-[#333333] flex items-center gap-2 transition-colors">
          {element.isLocked ? <IconUnlock className="w-4 h-4" /> : <IconLock className="w-4 h-4" />}
          {element.isLocked ? 'Unlock' : 'Lock'}
        </button>
        {element.type === 'image' && element.imageUrl && (
            <button onClick={onRemoveBackground} className="w-full text-left px-4 py-2 hover:bg-[#333333] flex items-center gap-2 transition-colors">
                <IconWand className="w-4 h-4" />
                Remove Background
            </button>
        )}
        <div className="border-t border-gray-700 my-1" />
        <button onClick={onDelete} className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#333333] flex items-center gap-2 transition-colors">
            <IconTrash className="w-4 h-4" />
            Delete
        </button>
      </div>
    </>
  );
};