import React, { useState, useRef, useCallback, CSSProperties, useEffect } from 'react';
import type { Slide, Palette, SlideElement, RealWorldImage } from '../types';
import { AssetLibraryModal } from './AssetLibraryModal';
import { LayerMenu } from './LayerMenu';
import { Toolbox } from './Toolbox';
import { PromptModal } from './PromptModal';
import {
  IconQuote, IconList, IconChart, IconCompare, IconTimeline,
  IconUsers, IconMap, IconBalance, IconProcess, IconQuestion,
  IconShare, IconMegaphone, IconCamera
} from './icons/SlideIcons';
import { regenerateImageForSlide, removeImageBackground } from '../services/geminiService';

interface SlideCardProps {
  slide: Slide;
  palette: Palette;
  realWorldImages: RealWorldImage[];
  onUpdate: (slide: Slide) => void;
  onSelectElement: (slideId: string | null, elementId: string | null) => void;
  selectedElementId: string | null;
}

const StyleIcon: React.FC<{ styleName: string; className?: string }> = ({ styleName, className }) => {
  const icons: { [key:string]: React.ElementType } = {
    'The Spotlight': IconMegaphone, 'The Analyst': IconList, 'The Visionary Quote': IconQuote,
    'The Data Flash': IconChart, 'The Versus Slide': IconCompare, 'The Timeline': IconTimeline,
    'The Key Players': IconUsers, 'The Map': IconMap, 'The Pros & Cons': IconBalance,
    'The Process': IconProcess, 'The Question': IconQuestion, 'The Closer': IconShare,
  };
  const Icon = icons[styleName] || IconMegaphone;
  return <Icon className={className} />;
};

const SNAP_THRESHOLD = 5;
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1440;

export const SlideCard: React.FC<SlideCardProps> = ({ slide, palette, realWorldImages, onUpdate, onSelectElement, selectedElementId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPromptingForImage, setIsPromptingForImage] = useState(false);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [processingElementId, setProcessingElementId] = useState<string | null>(null);
  const [isProcessingBackground, setIsProcessingBackground] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null);
  
  const dragInfo = useRef<{
    mode: 'move' | 'resize';
    elementId: string;
    offsetX: number;
    offsetY: number;
    originalX: number;
    originalY: number;
    originalWidth?: number;
    originalHeight?: number;
  } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [localSlide, setLocalSlide] = useState(slide);
  const [snapLines, setSnapLines] = useState<CSSProperties[]>([]);
  const [scalingFactor, setScalingFactor] = useState(0);

  useEffect(() => {
    setLocalSlide(slide);
  }, [slide]);

  useEffect(() => {
    if (containerRef.current) {
        const updateScale = () => {
            if (containerRef.current) {
                setScalingFactor(containerRef.current.clientWidth / CANVAS_WIDTH);
            }
        };
        updateScale();
        const resizeObserver = new ResizeObserver(updateScale);
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }
  }, []);
  
  const handleAddElement = useCallback((type: 'text' | 'shape' | 'image') => {
    if (type === 'image') {
      setIsPromptingForImage(true);
      return;
    }

    let newElement: SlideElement;
    if (type === 'text') {
        newElement = {
            id: crypto.randomUUID(), type: 'text', content: 'New Text',
            x: CANVAS_WIDTH / 2 - 150, y: CANVAS_HEIGHT / 2 - 25, width: 300, height: 50,
            isLocked: false, styles: { fontFamily: 'Open Sans', fontSize: 48, fontWeight: 'normal', textAlign: 'center', color: palette.colors.text },
        };
    } else { // shape
        newElement = {
            id: crypto.randomUUID(), type: 'shape', shapeType: 'rectangle',
            x: CANVAS_WIDTH / 2 - 200, y: CANVAS_HEIGHT / 2 - 100, width: 400, height: 200,
            isLocked: false, styles: { backgroundColor: palette.colors.primary + '80' },
        };
    }
    setLocalSlide(currentSlide => {
        const newSlide = { ...currentSlide, elements: [...currentSlide.elements, newElement] };
        onUpdate(newSlide);
        return newSlide;
    });
  }, [onUpdate, palette]);

  const handleGenerateImageFromPrompt = useCallback(async (prompt: string) => {
    setIsPromptingForImage(false);
    if (!prompt) return;

    const newWidth = CANVAS_WIDTH * 0.5;
    const newHeight = newWidth * (4 / 3);

    const placeholderElement: SlideElement = {
        id: crypto.randomUUID(), type: 'image',
        x: (CANVAS_WIDTH - newWidth) / 2, y: (CANVAS_HEIGHT - newHeight) / 2,
        width: newWidth, height: newHeight,
        isLocked: false, styles: {}, imageUrl: undefined,
    };

    setProcessingElementId(placeholderElement.id);
    
    setLocalSlide(currentSlide => {
        const slideWithPlaceholder = { ...currentSlide, elements: [...currentSlide.elements, placeholderElement] };
        onUpdate(slideWithPlaceholder);
        return slideWithPlaceholder;
    });

    try {
        const imageUrl = await regenerateImageForSlide(prompt, palette);
        setLocalSlide(currentSlide => {
            const elementsWithImage = currentSlide.elements.map(el =>
                el.id === placeholderElement.id ? { ...el, imageUrl } : el
            );
            const finalSlide = { ...currentSlide, elements: elementsWithImage };
            onUpdate(finalSlide);
            return finalSlide;
        });
    } catch (err) {
        console.error("Image generation failed:", err);
        window.alert(`Image generation failed: ${err instanceof Error ? err.message : String(err)}`);
        setLocalSlide(currentSlide => {
            const elementsWithoutPlaceholder = currentSlide.elements.filter(el => el.id !== placeholderElement.id);
            const finalSlide = { ...currentSlide, elements: elementsWithoutPlaceholder };
            onUpdate(finalSlide);
            return finalSlide;
        });
    } finally {
        setProcessingElementId(null);
    }
  }, [onUpdate, palette]);

  const handleDeleteElement = useCallback((elementId: string) => {
    setLocalSlide(currentSlide => {
      const newElements = currentSlide.elements.filter(el => el.id !== elementId);
      const newSlide = { ...currentSlide, elements: newElements };
      onUpdate(newSlide);
      return newSlide;
    });
    onSelectElement(null, null);
    setContextMenu(null);
  }, [onUpdate, onSelectElement]);

  const handleRemoveElementBackground = useCallback(async (elementId: string) => {
    const element = localSlide.elements.find(el => el.id === elementId);
    if (!element || element.type !== 'image' || !element.imageUrl) return;

    setProcessingElementId(elementId);
    setContextMenu(null);
    try {
        const newImageUrl = await removeImageBackground(element.imageUrl);
        setLocalSlide(currentSlide => {
          const newElements = currentSlide.elements.map(el => 
            el.id === elementId ? { ...el, imageUrl: newImageUrl } : el
          );
          const newSlide = { ...currentSlide, elements: newElements };
          onUpdate(newSlide);
          return newSlide;
        });
    } catch (err) {
        console.error("Background removal failed:", err);
    } finally {
        setProcessingElementId(null);
    }
  }, [localSlide, onUpdate]);
  
  const handleRemoveSelectedElementBackground = useCallback(() => {
    if (selectedElementId) {
      handleRemoveElementBackground(selectedElementId);
    }
  }, [selectedElementId, handleRemoveElementBackground]);

  const handleToggleImageVisibility = useCallback(() => {
    setLocalSlide(currentSlide => {
      const newSlide = { ...currentSlide, isImageVisible: !currentSlide.isImageVisible };
      onUpdate(newSlide);
      return newSlide;
    });
  }, [onUpdate]);

  const onRegenerateImage = useCallback(async (newVisualDescription: string) => {
    setLocalSlide(prev => ({...prev, isRegenerating: true, visualDescription: newVisualDescription}));

    try {
      const newImageUrl = await regenerateImageForSlide(newVisualDescription, palette);
       setLocalSlide(prev => {
          const newSlide = {...prev, imageUrl: newImageUrl, isRegenerating: false };
          onUpdate(newSlide);
          return newSlide;
       });
    } catch (err) {
      console.error(`Failed to regenerate image for slide ${localSlide.id}:`, err);
       window.alert(`Image generation failed: ${err instanceof Error ? err.message : String(err)}`);
       setLocalSlide(prev => {
        const newSlide = {...prev, isRegenerating: false};
        onUpdate(newSlide);
        return newSlide;
      });
    }
  }, [localSlide.id, onUpdate, palette]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedElementId && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        handleDeleteElement(selectedElementId);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElementId, handleDeleteElement]);

  const handleLayerAction = useCallback((action: 'forward' | 'backward' | 'front' | 'back', elementId: string) => {
    setLocalSlide(currentSlide => {
      let newElements = [...currentSlide.elements];
      const currentIndex = newElements.findIndex(el => el.id === elementId);
      if (currentIndex === -1) return currentSlide;

      const element = newElements.splice(currentIndex, 1)[0];
      switch (action) {
        case 'forward': newElements.splice(Math.min(currentIndex + 1, newElements.length), 0, element); break;
        case 'backward': newElements.splice(Math.max(currentIndex - 1, 0), 0, element); break;
        case 'front': newElements.push(element); break;
        case 'back': newElements.unshift(element); break;
      }
      const newSlide = { ...currentSlide, elements: newElements };
      onUpdate(newSlide);
      return newSlide;
    });
    setContextMenu(null);
  }, [onUpdate]);
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, element: SlideElement) => {
    if (editingElementId || element.isLocked) return;
    e.preventDefault(); e.stopPropagation();
    onSelectElement(slide.id, element.id);
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    dragInfo.current = {
      mode: 'move', elementId: element.id,
      offsetX: (e.clientX - rect.left) / scalingFactor,
      offsetY: (e.clientY - rect.top) / scalingFactor,
      originalX: element.x, originalY: element.y,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, element: SlideElement) => {
    e.preventDefault(); e.stopPropagation();
    dragInfo.current = {
        mode: 'resize', elementId: element.id,
        offsetX: e.clientX, offsetY: e.clientY,
        originalX: element.x, originalY: element.y,
        originalWidth: element.width, originalHeight: element.height,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragInfo.current || !canvasRef.current) return;
    
    setLocalSlide(currentSlide => {
        const { elementId, offsetX, offsetY } = dragInfo.current!;
        const canvasRect = canvasRef.current!.getBoundingClientRect();
        const scale = scalingFactor;
        const currentElement = currentSlide.elements.find(el => el.id === elementId);
        if (!currentElement) return currentSlide;

        let updatedElement: Partial<SlideElement> = {};
        
        if (dragInfo.current!.mode === 'move') {
            let newX = (e.clientX - canvasRect.left) / scale - offsetX;
            let newY = (e.clientY - canvasRect.top) / scale - offsetY;
            const otherElements = currentSlide.elements.filter(el => el.id !== elementId);
            const newSnapLines: CSSProperties[] = [];
            const currentBounds = { left: newX, right: newX + currentElement.width, centerX: newX + currentElement.width / 2 };
            const canvasCenter = { x: CANVAS_WIDTH / 2 };
            if (Math.abs(currentBounds.centerX - canvasCenter.x) < SNAP_THRESHOLD) {
                newX = canvasCenter.x - currentElement.width / 2;
                newSnapLines.push({ left: '50%', top: 0, width: 1, height: '100%', backgroundColor: '#BB86FC' });
            }
            otherElements.forEach(other => {
                const otherBounds = { left: other.x, right: other.x + other.width, centerX: other.x + other.width / 2 };
                if (Math.abs(currentBounds.left - otherBounds.left) < SNAP_THRESHOLD) {
                    newX = other.x;
                    newSnapLines.push({ left: `${other.x / CANVAS_WIDTH * 100}%`, top: 0, width: 1, height: '100%', backgroundColor: '#BB86FC' });
                }
                if (Math.abs(currentBounds.right - otherBounds.right) < SNAP_THRESHOLD) {
                    newX = other.x + other.width - currentElement.width;
                    newSnapLines.push({ left: `${otherBounds.right / CANVAS_WIDTH * 100}%`, top: 0, width: 1, height: '100%', backgroundColor: '#BB86FC' });
                }
            });
            setSnapLines(newSnapLines);
            updatedElement = { x: newX, y: newY };
        } else if (dragInfo.current!.mode === 'resize' && dragInfo.current!.originalWidth && dragInfo.current!.originalHeight) {
            const dx = (e.clientX - dragInfo.current!.offsetX) / scale;
            const dy = (e.clientY - dragInfo.current!.offsetY) / scale;
            const newWidth = Math.max(20, dragInfo.current!.originalWidth + dx);
            const newHeight = Math.max(20, dragInfo.current!.originalHeight + dy);
            updatedElement = { width: newWidth, height: newHeight };
        }

        const newElements = currentSlide.elements.map(el => el.id === elementId ? { ...el, ...updatedElement } : el);
        return { ...currentSlide, elements: newElements };
    });
  }, [scalingFactor]);
  
  const handleMouseUp = useCallback(() => {
    if (dragInfo.current) { onUpdate(localSlide); }
    dragInfo.current = null;
    setSnapLines([]);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [localSlide, onUpdate, handleMouseMove]);

  const handleContextMenu = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault(); e.stopPropagation();
    onSelectElement(slide.id, elementId);
    const canvasRect = canvasRef.current!.getBoundingClientRect();
    setContextMenu({ x: e.clientX - canvasRect.left, y: e.clientY - canvasRect.top, elementId });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;
    const { url, source } = JSON.parse(data) as RealWorldImage;
    
    setLocalSlide(currentSlide => {
      const citationElement: SlideElement = {
        id: crypto.randomUUID(), type: 'text', content: `Photo: ${source}`,
        x: CANVAS_WIDTH - 260, y: CANVAS_HEIGHT - 45, width: 240, height: 30,
        isLocked: false,
        styles: { fontFamily: 'Open Sans', fontSize: 18, fontWeight: 'normal', textAlign: 'right', color: '#FFFFFF' },
      };
      const newElements = [...currentSlide.elements, citationElement];
      const newSlide: Slide = { ...currentSlide, imageUrl: url, elements: newElements, isImageVisible: true };
      onUpdate(newSlide);
      return newSlide;
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  
  const handleElementUpdate = (elementId: string, updates: Partial<SlideElement>) => {
      setLocalSlide(currentSlide => {
        const newElements = currentSlide.elements.map(el => el.id === elementId ? { ...el, ...updates } : el);
        return { ...currentSlide, elements: newElements };
      });
  };

  return (
    <>
      {isPromptingForImage && (
        <PromptModal
          title="Generate Image Element"
          message="Describe the image you want to create on your slide."
          onConfirm={handleGenerateImageFromPrompt}
          onCancel={() => setIsPromptingForImage(false)}
        />
      )}
      <div 
        ref={containerRef}
        className="bg-[#121212] rounded-xl shadow-lg flex flex-col transition-transform hover:scale-105 duration-300 aspect-[3/4] relative group/card"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        data-slide-id={slide.id}
      >
        <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div 
                ref={canvasRef} 
                className="relative origin-top-left" 
                style={{
                    width: CANVAS_WIDTH,
                    height: CANVAS_HEIGHT,
                    transform: `scale(${scalingFactor})`,
                    backgroundColor: palette.colors.bg
                }} 
                onClick={() => onSelectElement(null, null)}
                data-export-target-id={slide.id}
            >
            {localSlide.isImageVisible && localSlide.imageUrl && (
                <img src={localSlide.imageUrl} alt={localSlide.visualDescription} className="absolute top-0 left-0 w-full h-full object-cover z-0" aria-hidden="true" draggable="false" />
            )}

            {localSlide.elements.map((element, index) => {
                const isEditing = editingElementId === element.id;
                const isSelected = selectedElementId === element.id;
                const isProcessing = processingElementId === element.id;
                
                return (
                <div
                    key={element.id}
                    className="group absolute"
                    style={{
                        position: 'absolute', top: 0, left: 0,
                        transform: `translate(${element.x}px, ${element.y}px)`,
                        width: element.width, height: element.height,
                        zIndex: index + 1, cursor: element.isLocked ? 'not-allowed' : 'grab',
                        outline: isSelected ? '2px solid #BB86FC' : 'none', outlineOffset: '2px',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, element)}
                    onClick={(e) => { e.stopPropagation(); onSelectElement(slide.id, element.id); }}
                    onDoubleClick={() => element.type === 'text' && !element.isLocked && setEditingElementId(element.id)}
                    onContextMenu={(e) => handleContextMenu(e, element.id)}
                >
                    <div className="w-full h-full relative" style={{
                        fontFamily: element.styles.fontFamily ? `'${element.styles.fontFamily}', sans-serif` : undefined,
                        fontSize: element.styles.fontSize ? `${element.styles.fontSize}px` : undefined,
                        fontWeight: element.styles.fontWeight, color: element.styles.color,
                        textAlign: element.styles.textAlign, textTransform: element.styles.textTransform,
                        backgroundColor: element.styles.backgroundColor,
                    }}>
                    {element.type === 'image' && element.imageUrl && <img src={element.imageUrl} className="w-full h-full object-cover" alt="Generated element" />}
                    {element.type === 'text' && isEditing ? (
                        <textarea
                        value={element.content}
                        onChange={(e) => handleElementUpdate(element.id, { content: e.target.value })}
                        onBlur={() => { setEditingElementId(null); onUpdate(localSlide); }}
                        autoFocus className="w-full h-full bg-transparent resize-none focus:outline-none p-1"
                        style={{ color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', textAlign: 'inherit' }}
                        />
                    ) : element.type === 'text' ? (
                        <div className="p-1">{element.content?.split('\n').map((line, i) => <div key={i}>{line}</div>)}</div>
                    ) : null}

                    {isProcessing && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-white"></div>
                        </div>
                    )}
                    </div>
                    {!element.isLocked && (
                        <div
                        onMouseDown={(e) => handleResizeMouseDown(e, element)}
                        className={`absolute -bottom-2 -right-2 w-4 h-4 bg-[#BB86FC] border-2 border-white rounded-full cursor-se-resize z-50 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        />
                    )}
                </div>
                );
            })}
            
            {snapLines.map((style, i) => (
                <div key={i} className="absolute" style={{...style, zIndex: 9999}} />
            ))}

            {contextMenu && (
                <LayerMenu
                x={contextMenu.x} y={contextMenu.y}
                element={localSlide.elements.find(el => el.id === contextMenu.elementId)!}
                onBringForward={() => handleLayerAction('forward', contextMenu.elementId)}
                onSendBackward={() => handleLayerAction('backward', contextMenu.elementId)}
                onBringToFront={() => handleLayerAction('front', contextMenu.elementId)}
                onSendToBack={() => handleLayerAction('back', contextMenu.elementId)}
                onToggleLock={() => {
                    setLocalSlide(currentSlide => {
                        const newElements = currentSlide.elements.map(el => 
                            el.id === contextMenu.elementId ? { ...el, isLocked: !el.isLocked } : el
                        );
                        const newSlide = { ...currentSlide, elements: newElements };
                        onUpdate(newSlide);
                        return newSlide;
                    });
                    setContextMenu(null);
                }}
                onDelete={() => handleDeleteElement(contextMenu.elementId)}
                onRemoveBackground={() => handleRemoveElementBackground(contextMenu.elementId)}
                onClose={() => setContextMenu(null)}
                />
            )}
            </div>
        </div>
        
        <Toolbox
          onAddElement={handleAddElement}
          isImageVisible={!!localSlide.isImageVisible}
          onToggleImageVisibility={handleToggleImageVisibility}
          hasImage={!!localSlide.imageUrl}
          onRemoveSelectedElementBackground={handleRemoveSelectedElementBackground}
          isElementSelectedAndRemovable={!!selectedElementId && !!localSlide.elements.find(el => el.id === selectedElementId && el.type === 'image' && !!el.imageUrl)}
        />
        
        <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
          <header className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <StyleIcon styleName={slide.styleName} className="w-5 h-5 text-[#BB86FC]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{slide.styleName}</h3>
              </div>
              <div className="bg-[#121212] text-white text-xs font-bold w-8 h-8 flex items-center justify-center rounded-full">
                {slide.slideNumber}
              </div>
          </header>
        </div>
        
        {(localSlide.isRegenerating || isProcessingBackground) && (
          <div className="absolute inset-0 bg-black/70 z-40 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-[#03DAC6]"></div>
              <p className="mt-4 text-sm font-semibold text-gray-300">
                {isProcessingBackground ? 'Removing background...' : 'Regenerating...'}
              </p>
          </div>
        )}
        
        <button 
            onClick={() => setIsModalOpen(true)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 hover:bg-black/80"
            aria-label="Change background image"
        >
            <IconCamera className="w-8 h-8 text-white" />
        </button>
      </div>

      {isModalOpen && (
        <AssetLibraryModal 
          slide={localSlide}
          palette={palette}
          realWorldImages={realWorldImages}
          onClose={() => setIsModalOpen(false)}
          onRegenerate={(newVisualDescription) => {
            onRegenerateImage(newVisualDescription);
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
};
