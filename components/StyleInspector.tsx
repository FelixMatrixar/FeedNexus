import React from 'react';
import type { SlideElement, Palette } from '../types';
import { IconAlignLeft, IconAlignCenter, IconAlignRight, IconAlignJustify } from './icons/SlideIcons';

interface StyleInspectorProps {
  element: SlideElement;
  palette: Palette;
  onUpdate: (updates: Partial<SlideElement['styles']>) => void;
  onClose: () => void;
}

const ColorSwatch: React.FC<{ color: string, isSelected: boolean, onClick: () => void }> = ({ color, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${isSelected ? 'border-white' : 'border-transparent'}`}
        style={{ backgroundColor: color }}
        aria-label={`Select color ${color}`}
    />
);

const AlignmentButton: React.FC<{
    onClick: () => void;
    title: string;
    isSelected: boolean;
    children: React.ReactNode;
}> = ({ onClick, title, isSelected, children }) => (
    <button
        onClick={onClick}
        title={title}
        className={`p-2 rounded-md transition-colors ${isSelected ? 'bg-[#BB86FC]/50 text-white' : 'text-gray-400 hover:bg-[#333333]'}`}
    >
        {children}
    </button>
);


export const StyleInspector: React.FC<StyleInspectorProps> = ({ element, palette, onUpdate, onClose }) => {
    const paletteColors = Object.values(palette.colors);

    return (
        <div className="fixed bottom-8 right-8 z-40 bg-[#1E1E1E] text-white rounded-xl shadow-2xl w-72 border border-gray-700">
            <header className="flex justify-between items-center p-3 border-b border-gray-700">
                <h3 className="font-bold text-lg">Style Inspector</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </header>

            <div className="p-4 space-y-4">
                {element.type === 'text' && (
                    <>
                        <div className="space-y-2">
                            <label htmlFor="font-size" className="text-sm font-bold text-gray-300">Font Size</label>
                            <input
                                type="number"
                                id="font-size"
                                value={element.styles.fontSize || ''}
                                onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value, 10) })}
                                className="w-full px-3 py-2 bg-[#121212] border-2 border-transparent focus:border-[#BB86FC] rounded-lg text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300 block">Alignment</label>
                            <div className="flex items-center bg-[#121212] rounded-lg p-1">
                                <AlignmentButton
                                    onClick={() => onUpdate({ textAlign: 'left' })}
                                    title="Align Left"
                                    isSelected={element.styles.textAlign === 'left'}
                                >
                                    <IconAlignLeft className="w-5 h-5" />
                                </AlignmentButton>
                                <AlignmentButton
                                    onClick={() => onUpdate({ textAlign: 'center' })}
                                    title="Align Center"
                                    isSelected={element.styles.textAlign === 'center'}
                                >
                                    <IconAlignCenter className="w-5 h-5" />
                                </AlignmentButton>
                                <AlignmentButton
                                    onClick={() => onUpdate({ textAlign: 'right' })}
                                    title="Align Right"
                                    isSelected={element.styles.textAlign === 'right'}
                                >
                                    <IconAlignRight className="w-5 h-5" />
                                </AlignmentButton>
                                <AlignmentButton
                                    onClick={() => onUpdate({ textAlign: 'justify' })}
                                    title="Justify"
                                    isSelected={element.styles.textAlign === 'justify'}
                                >
                                    <IconAlignJustify className="w-5 h-5" />
                                </AlignmentButton>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300">Text Color</label>
                            <div className="flex flex-wrap gap-2">
                                {paletteColors.map(color => (
                                    <ColorSwatch
                                        key={color}
                                        color={color}
                                        isSelected={element.styles.color === color}
                                        onClick={() => onUpdate({ color })}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
                {element.type === 'shape' && (
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300">Fill Color</label>
                        <div className="flex flex-wrap gap-2">
                             {paletteColors.map(color => (
                                <ColorSwatch
                                    key={color}
                                    color={color}
                                    isSelected={element.styles.backgroundColor === color}
                                    onClick={() => onUpdate({ backgroundColor: color })}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};