import React, { useState, useCallback } from 'react';
import type { CarouselPlan, Slide, Palette, RealWorldImage, SlideElement } from '../types';
import { SlideCard } from './SlideCard';
import { StyleInspector } from './StyleInspector';

interface CarouselPreviewProps {
  plan: CarouselPlan;
  palette: Palette;
  realWorldImages: RealWorldImage[];
  onUpdateSlide: (slide: Slide) => void;
}

export const CarouselPreview: React.FC<CarouselPreviewProps> = ({ plan, palette, realWorldImages, onUpdateSlide }) => {
  const [selectedElement, setSelectedElement] = useState<{ slideId: string; elementId: string } | null>(null);

  const handleSelectElement = useCallback((slideId: string | null, elementId: string | null) => {
    if (slideId && elementId) {
      setSelectedElement({ slideId, elementId });
    } else {
      setSelectedElement(null);
    }
  }, []);

  const handleUpdateElementStyle = (styleUpdates: Partial<SlideElement['styles']>) => {
    if (!selectedElement) return;

    const slideToUpdate = plan.slides.find(s => s.id === selectedElement.slideId);
    if (!slideToUpdate) return;

    const newElements = slideToUpdate.elements.map(el =>
      el.id === selectedElement.elementId
        ? { ...el, styles: { ...el.styles, ...styleUpdates } }
        : el
    );

    onUpdateSlide({ ...slideToUpdate, elements: newElements });
  };
  
  const selectedSlide = plan.slides.find(s => s.id === selectedElement?.slideId);
  const selectedElementData = selectedSlide?.elements.find(e => e.id === selectedElement?.elementId);

  return (
    <section aria-labelledby="carousel-plan-title" className="relative">
      <h2 id="carousel-plan-title" className="text-center text-3xl font-bold uppercase text-[#BB86FC] tracking-wider mb-2">
        Interactive Story Editor
      </h2>
      <p className="text-center text-gray-400 mb-8">Click an element to edit styles. Double-click text to edit content. Drag to move. Right-click for more options.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
        {plan.slides.map((slide) => (
          <SlideCard 
            key={slide.id} 
            slide={slide} 
            palette={palette}
            realWorldImages={realWorldImages}
            onUpdate={onUpdateSlide}
            onSelectElement={handleSelectElement}
            selectedElementId={selectedElement?.slideId === slide.id ? selectedElement.elementId : null}
          />
        ))}
      </div>
      
      {selectedElementData && (
        <StyleInspector
          element={selectedElementData}
          palette={palette}
          onUpdate={handleUpdateElementStyle}
          onClose={() => setSelectedElement(null)}
        />
      )}
    </section>
  );
};