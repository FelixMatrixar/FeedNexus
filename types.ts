export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface RealWorldImage {
  url: string;
  source: string;
}

export interface Story {
  title: string;
  source: string;
  summary: string;
  groundingChunks: GroundingChunk[];
  realWorldImages: RealWorldImage[];
}

export enum SlideStyle {
  Spotlight = 'The Spotlight',
  Analyst = 'The Analyst',
  VisionaryQuote = 'The Visionary Quote',
  DataFlash = 'The Data Flash',
  Versus = 'The Versus Slide',
  Timeline = 'The Timeline',
  KeyPlayers = 'The Key Players',
  Map = 'The Map',
  ProsCons = 'The Pros & Cons',
  Process = 'The Process',
  Question = 'The Question',
  Closer = 'The Closer',
}

export interface StyleRecommendation {
  styleName: SlideStyle;
  suitability: 'Recommended' | 'Neutral' | 'Not Recommended';
  reason: string;
  assetSuggestion: string;
}

export interface SlideElement {
  id: string;
  type: 'text' | 'shape' | 'image';
  content?: string;
  imageUrl?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isLocked: boolean;
  shapeType?: 'rectangle';
  styles: {
    // Text styles
    fontFamily?: 'Montserrat' | 'Open Sans' | 'Source Code Pro';
    fontSize?: number;
    fontWeight?: 'bold' | 'normal' | 'medium';
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    color?: string;
    textTransform?: 'uppercase' | 'none';

    // Shape styles
    backgroundColor?: string;
  };
}

export interface Slide {
  id: string;
  slideNumber: number;
  styleName: string;
  elements: SlideElement[];
  visualDescription: string;
  imageUrl?: string;
  isRegenerating?: boolean;
  isImageVisible: boolean;
}

export interface CarouselPlan {
  slides: Slide[];
}

export interface Palette {
  name: string;
  colors: {
    bg: string;
    text: string;
    primary: string;
    secondary: string;
    container: string;
  };
}

export type PaletteOption = Palette;