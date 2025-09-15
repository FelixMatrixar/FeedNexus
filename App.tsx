import React, { useState, useCallback } from 'react';
import { TopicInput } from './components/TopicInput';
import { StoryConfirmation } from './components/StoryConfirmation';
import { CarouselPreview } from './components/CarouselPreview';
import { Loader } from './components/Loader';
import { AudioPlayer } from './components/AudioPlayer';
import type { Story, CarouselPlan, Slide, Palette, RealWorldImage } from './types';
import { generateInitialCarouselPlan } from './services/geminiService';
import { IconDownload } from './components/icons/SlideIcons';
import { PALETTES } from './constants';

// Declare global variables from CDN scripts
declare var htmlToImage: any;
declare var JSZip: any;
declare var saveAs: any;

type AppState = 'TOPIC_INPUT' | 'GENERATING_INITIAL_STORY' | 'EDITING';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('TOPIC_INPUT');
  const [topic, setTopic] = useState<string>('AI and Technology');
  const [story, setStory] = useState<Story | null>(null);
  const [carouselPlan, setCarouselPlan] = useState<CarouselPlan | null>(null);
  const [realWorldImages, setRealWorldImages] = useState<RealWorldImage[]>([]);
  const [palette, setPalette] = useState<Palette>(PALETTES[0]);
  const [error, setError] = useState<string | null>(null);
  const [generationLog, setGenerationLog] = useState<string[]>([]);
  const [spokenSummary, setSpokenSummary] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleTopicSubmit = useCallback(async (currentTopic: string) => {
    setTopic(currentTopic);
    setError(null);
    setStory(null);
    setCarouselPlan(null);
    setRealWorldImages([]);
    setGenerationLog([]);
    setSpokenSummary(null);
    setAppState('GENERATING_INITIAL_STORY');

    try {
      const onProgress = (message: string) => {
        setGenerationLog(prev => [...prev, message]);
      };
      
      const { story: foundStory, plan, spokenSummary: summaryAudioText } = await generateInitialCarouselPlan(currentTopic, palette, onProgress);
      
      setStory(foundStory);
      setCarouselPlan(plan);
      setRealWorldImages(foundStory.realWorldImages || []);
      setSpokenSummary(summaryAudioText);
      setAppState('EDITING');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during initial story generation.');
      setAppState('TOPIC_INPUT');
    }
  }, [palette]);

  const handleUpdateSlide = useCallback((updatedSlide: Slide) => {
    setCarouselPlan(prevPlan => {
      if (!prevPlan) return null;
      const newSlides = prevPlan.slides.map(s => s.id === updatedSlide.id ? updatedSlide : s);
      return { ...prevPlan, slides: newSlides };
    });
  }, []);
  
  const handleReset = () => {
    setAppState('TOPIC_INPUT');
    setStory(null);
    setCarouselPlan(null);
    setRealWorldImages([]);
    setError(null);
    setSpokenSummary(null);
  };

  const handleExport = async () => {
    if (!carouselPlan || !spokenSummary) return;
    setIsExporting(true);
    try {
      const zip = new JSZip();

      // Pre-fetch Google Fonts CSS as text to pass directly to html-to-image.
      // This avoids cross-origin errors when the library tries to read the CSS rules from a linked stylesheet.
      const fontCssUrl = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Open+Sans:wght@400&family=Source+Code+Pro:wght@500&display=swap';
      const fontEmbedCss = await fetch(fontCssUrl).then(res => res.text());

      const slidePromises = carouselPlan.slides.map(async (slide, index) => {
        const element = document.querySelector(`[data-export-target-id="${slide.id}"]`) as HTMLElement;
        if (element) {
          try {
            const blob = await htmlToImage.toBlob(element, { 
                width: 1080, 
                height: 1440,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left',
                },
                fontEmbedCss: fontEmbedCss,
            });
            if (blob) {
              zip.file(`slide-${index + 1}.png`, blob);
            }
          } catch(err) {
            console.error(`Failed to export slide ${index + 1}:`, err);
          }
        }
      });

      await Promise.all(slidePromises);
      zip.file('summary.txt', spokenSummary);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'FeedNexus-Carousel.zip');

    } catch (err) {
      console.error("Export failed:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during export.');
    } finally {
      setIsExporting(false);
    }
  };

  const isLoading = appState === 'GENERATING_INITIAL_STORY';

  const renderContent = () => {
    switch (appState) {
      case 'TOPIC_INPUT':
        return <TopicInput 
            initialTopic={topic} 
            onSubmit={handleTopicSubmit} 
            isLoading={isLoading}
            palettes={PALETTES}
            selectedPalette={palette}
            onPaletteChange={setPalette}
        />;
      
      case 'GENERATING_INITIAL_STORY':
        return <Loader log={generationLog} />;

      case 'EDITING':
        return (
          <div className="mt-10 space-y-10">
            {spokenSummary && <AudioPlayer text={spokenSummary} />}
            {story && <StoryConfirmation story={story} />}
            {carouselPlan && (
                <CarouselPreview 
                    plan={carouselPlan} 
                    palette={palette}
                    realWorldImages={realWorldImages}
                    onUpdateSlide={handleUpdateSlide}
                />
            )}
             <div className="text-center mt-12 space-y-4">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-[#BB86FC] text-[#121212] font-bold rounded-lg uppercase tracking-wider hover:bg-[#a16bea] focus:outline-none focus:ring-4 focus:ring-[#BB86FC]/50 transition-all duration-300"
                >
                  Start Over
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="px-8 py-3 bg-transparent border-2 border-[#03DAC6] text-[#03DAC6] font-bold rounded-lg uppercase tracking-wider hover:bg-[#03DAC6]/20 focus:outline-none focus:ring-4 focus:ring-[#03DAC6]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                >
                   {isExporting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <IconDownload className="w-5 h-5 mr-2" />
                      Export as Zip
                    </>
                  )}
                </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#FFFFFF] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#BB86FC] to-[#03DAC6] cursor-pointer" onClick={handleReset}>
            FeedNexus
          </h1>
          <p className="text-lg text-gray-400 mt-2">
            AI generates the first draft. You perfect the final story.
          </p>
        </header>

        <main>
          {error && (
            <div className="my-8 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center">
              <p className="font-bold">An Error Occurred</p>
              <p>{error}</p>
              <button onClick={() => setError(null)} className="mt-2 text-sm underline">Dismiss</button>
            </div>
          )}
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
