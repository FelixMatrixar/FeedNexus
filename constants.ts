import { Type } from "@google/genai";
// FIX: Changed import to allow SlideStyle to be used as a value for the enum.
import { SlideStyle, type Palette } from './types';

export const BRAND_IDENTITY = `
Core Color Palette:
#121212 (Onyx - Primary Background)
#FFFFFF (White - Primary Text, Headlines)
#BB86FC (Mauve - Primary Accent)
#03DAC6 (Teal - Secondary Accent)
#333333 (Dark Gray - Container Backgrounds)

Typography:
Headlines/Titles: Montserrat, Bold, Uppercase
Body Text: Open Sans, Regular, Sentence case
Data/Quotes: Source Code Pro, Medium
`;

export const STYLE_LIBRARY = `
Here is your toolkit of 12 distinct slide styles. You will choose from this library to build the carousel.

1.  The Spotlight (Hook): A full-bleed, high-impact image with a gradient overlay at the bottom holding the headline.
2.  The Analyst (Key Takeaways): A clean layout with a title and 3-4 bullet points, each with an icon.
3.  The VisionaryQuote (Impactful Statement): A large, centered quote framed by stylized quotation marks.
4.  The Data Flash (The Big Number): An ultra-minimalist slide showcasing a single, massive statistic.
5.  The Versus Slide (Comparison): A split screen comparing two opposing ideas, entities, or outcomes.
6.  The Timeline (Historical Context): A vertical line with key dates and events to show sequence.
7.  The Key Players (The "Who"): A grid of 2-4 circular frames for headshots or logos with names and descriptors.
8.  The Map (Geographic Context): A stylized map graphic highlighting the relevant location(s).
9.  The Pros & Cons (Balanced View): A two-column layout exploring positive and negative implications.
10. The Process (The "How"): 3-4 numbered boxes explaining a complex process or workflow.
11. The Question (Audience Engagement): A visually engaging slide posing a direct question to the audience.
12. The Closer (Call to Action): A final slide with clear instructions to follow, save, and share.
`;

export const ART_DIRECTION_GUIDELINES = `
Universal Mandates: The Unbreakable Rules
These rules apply to every slide you generate.

1. THE VISUAL MANDATE: Metaphorical Abstraction ONLY
All visuals MUST be metaphorical and abstract. The 'visualDescription' field you generate MUST be a detailed, art-directed prompt for an image generator that embodies this principle.

2. THE TYPOGRAPHY MANDATE: Hierarchy & Readability
Structure text with a clear hierarchy. Use 'Montserrat' for headlines, 'Open Sans' for body text. Ensure body text is at least 24pt for mobile readability.

3. THE GRID & LAYOUT MANDATE: Professional Structure
Avoid simple centered layouts. Create sophisticated, asymmetrical compositions on a professional grid. Use generous whitespace. The primary headline MUST be placed in the top third of the canvas (y < 480).

4. THE COLOR MANDATE: Palette Discipline
You MUST use the colors from the user-selected palette for all text 'color' values and shape 'backgroundColor' values.

Layout Generation Mandate:
For each slide, you will generate a complete layout by populating an 'elements' array.
- The canvas is 1080px wide and 1440px tall (a 3:4 aspect ratio). All coordinates and dimensions MUST be within this boundary.
- The 'x' and 'y' coordinates represent the top-left corner of the element's bounding box.
- The array order of the elements determines their stacking order (z-index). The first element in the array is at the back, the last is at the front.
- You MUST provide coordinates that adhere to the GRID & LAYOUT MANDATE.
`;

export const CAROUSEL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    slides: {
      type: Type.ARRAY,
      description: "An array of slide objects.",
      items: {
        type: Type.OBJECT,
        properties: {
          slideNumber: { type: Type.INTEGER },
          styleName: { type: Type.STRING },
          visualDescription: {
            type: Type.STRING,
            description: "A detailed, art-directed prompt for an AI image generator following the VISUAL MANDATE. For 'The Visionary Quote', 'The Question', and 'The Closer' slides ONLY, state 'No visual needed'."
          },
          elements: {
            type: Type.ARRAY,
            description: "All visual text elements on the slide, ordered from back to front (z-index).",
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['text', 'shape', 'image'] },
                content: { type: Type.STRING, description: "The text content of the element. Can be empty for shapes or images." },
                imageUrl: { type: Type.STRING, description: "Base64 data URL for an image element. Null for other types." },
                x: { type: Type.INTEGER, description: "The x-coordinate of the top-left corner (0-1080)." },
                y: { type: Type.INTEGER, description: "The y-coordinate of the top-left corner (0-1440)." },
                width: { type: Type.INTEGER, description: "The width of the element." },
                height: { type: Type.INTEGER, description: "The height of the element." },
                isLocked: { type: Type.BOOLEAN, description: "Set to false. User will lock if needed." },
                shapeType: { type: Type.STRING, enum: ['rectangle'], description: "The type of shape, if the element type is 'shape'." },
                styles: {
                  type: Type.OBJECT,
                  properties: {
                    fontFamily: { type: Type.STRING, enum: ['Montserrat', 'Open Sans', 'Source Code Pro'] },
                    fontSize: { type: Type.INTEGER, description: "Font size in pixels." },
                    fontWeight: { type: Type.STRING, enum: ['bold', 'normal', 'medium'] },
                    textAlign: { type: Type.STRING, enum: ['left', 'center', 'right', 'justify'] },
                    color: { type: Type.STRING, description: "A hex color code from the user's palette for text." },
                    textTransform: { type: Type.STRING, enum: ['uppercase', 'none'] },
                    backgroundColor: { type: Type.STRING, description: "A hex color code from the user's palette for shapes." },
                  }
                }
              },
              required: ["type", "x", "y", "width", "height", "isLocked", "styles"]
            }
          }
        },
        required: ["slideNumber", "styleName", "visualDescription", "elements"]
      }
    }
  },
  required: ["slides"]
};

export const STORY_AND_ASSETS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    story: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        source: { type: Type.STRING },
        summary: { type: Type.STRING }
      },
      required: ["title", "source", "summary"]
    },
    realWorldImages: {
      type: Type.ARRAY,
      description: "An array of relevant real-world images found for the story.",
      items: {
        type: Type.OBJECT,
        properties: {
          url: { type: Type.STRING, description: "Direct URL to the image file." },
          source: { type: Type.STRING, description: "The name of the source organization (e.g., Reuters, Associated Press)." }
        },
        required: ["url", "source"]
      }
    }
  },
  required: ["story", "realWorldImages"]
};

export const PALETTES: Palette[] = [
  {
    name: "FeedNexus Original",
    colors: {
      bg: '#121212',
      text: '#FFFFFF',
      primary: '#BB86FC',
      secondary: '#03DAC6',
      container: '#333333',
    },
  },
  {
    name: "Midnight Tech",
    colors: {
      bg: '#0D1B2A',
      text: '#E0E1DD',
      primary: '#36A2EB',
      secondary: '#FF6B6B',
      container: '#1B263B',
    },
  },
  {
    name: "Sunrise News",
    colors: {
      bg: '#F8F9FA',
      text: '#212529',
      primary: '#FF8C00',
      secondary: '#4682B4',
      container: '#E9ECEF',
    },
  },
  {
      name: "Eco Report",
      colors: {
        bg: '#F0F4F0',
        text: '#2F3E46',
        primary: '#4CAF50',
        secondary: '#8BC34A',
        container: '#E8F5E9',
      },
  }
];

// FIX: Used SlideStyle enum members instead of string literals to satisfy the SlideStyle[] type.
export const NO_IMAGE_STYLES: SlideStyle[] = [
  SlideStyle.VisionaryQuote,
  SlideStyle.Question,
  SlideStyle.Closer,
];

export const SLIDE_TEMPLATES: Record<SlideStyle, { title: string; structure: string[]; }> = {
  'The Spotlight': { title: 'TITLE', structure: ['[High-impact visual placeholder]'] },
  'The Analyst': { title: 'KEY TAKEAWAYS', structure: ['+ [Icon] Key Point 1...', '+ [Icon] Key Point 2...', '+ [Icon] Key Point 3...'] },
  'The Visionary Quote': { title: 'QUOTE', structure: ['" [Impactful statement goes here...] "'] },
  'The Data Flash': { title: 'THE BIG NUMBER', structure: ['[HUGE NUMBER OR STAT]', '[Brief line of context]'] },
  'The Versus Slide': { title: 'COMPARISON', structure: ['[Title A] vs [Title B]', '- [Point A1]', '- [Point B1]'] },
  'The Timeline': { title: 'TIMELINE', structure: ['- Event 1...', '- Event 2...', '- Event 3...'] },
  'The Key Players': { title: 'THE "WHO"', structure: ['(O) Player 1', '(O) Player 2'] },
  'The Map': { title: 'GEOGRAPHIC CONTEXT', structure: ['[Stylized map graphic]', '[Description of location]'] },
  'The Pros & Cons': { title: 'BALANCED VIEW', structure: ['Pros:', '- [Positive point]', 'Cons:', '- [Negative point]'] },
  'The Process': { title: 'THE "HOW"', structure: ['1. Step One...', '2. Step Two...', '3. Step Three...'] },
  'The Question': { title: 'ENGAGEMENT', structure: ['[Direct question for the audience?]'] },
  'The Closer': { title: 'CALL TO ACTION', structure: ['FOLLOW | SAVE | SHARE'] },
};

export const RECOMMENDATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    recommendations: {
      type: Type.ARRAY,
      description: "An array of suitability recommendations for each slide style.",
      items: {
        type: Type.OBJECT,
        properties: {
          styleName: {
            type: Type.STRING,
            description: "The name of the slide style from the Style Library.",
            enum: Object.keys(SLIDE_TEMPLATES),
          },
          suitability: {
            type: Type.STRING,
            description: "The suitability rating.",
            enum: ['Recommended', 'Neutral', 'Not Recommended'],
          },
          reason: {
            type: Type.STRING,
            description: "A concise reason for the suitability rating."
          },
          assetSuggestion: {
            type: Type.STRING,
            description: "A clear recommendation for the asset type, e.g., 'Recommended: Generate Abstract' or 'Recommended: Find Real Image'."
          }
        },
        required: ["styleName", "suitability", "reason", "assetSuggestion"]
      }
    }
  },
  required: ["recommendations"]
};