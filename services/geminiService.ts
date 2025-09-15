import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { Story, CarouselPlan, GroundingChunk, Slide, SlideStyle, StyleRecommendation, Palette, SlideElement, RealWorldImage } from '../types';
import { ART_DIRECTION_GUIDELINES, BRAND_IDENTITY, CAROUSEL_SCHEMA, RECOMMENDATION_SCHEMA, STYLE_LIBRARY, STORY_AND_ASSETS_SCHEMA } from '../constants';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}
if (!process.env.SERPAPI_KEY) {
  console.warn("SERPAPI_KEY environment variable is not set. Real-world image fetching will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to extract JSON from a string that might be wrapped in markdown.
function extractJson(text: string): string {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        return match[1];
    }
    
    // Fallback for cases where the AI doesn't use markdown but includes extra text
    const startIndex = text.indexOf('{');
    const lastIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && lastIndex > startIndex) {
        return text.substring(startIndex, lastIndex + 1);
    }
    
    console.warn("Could not find JSON in the response string. Returning the original string.");
    return text;
}

const imageUrlToBase64 = async (imageUrl: string): Promise<string> => {
  try {
    // Using a more reliable proxy service (allorigins.win) to avoid 403 errors from websites with hotlink protection.
    // The URL is encoded to ensure special characters are handled correctly.
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      console.error(`Failed to fetch image from proxy: ${response.status} ${response.statusText} for URL: ${imageUrl}`);
      return '';
    }
    const blob = await response.blob();
    
    if (!blob.type.startsWith('image/')) {
        console.warn(`URL did not return an image type. MimeType: ${blob.type}, URL: ${imageUrl}`);
        return '';
    }
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(''); // Resolve with empty string on error
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Could not convert image URL to base64: ${imageUrl}`, error);
    return '';
  }
};

const fetchImagesWithSerpApi = async (query: string): Promise<RealWorldImage[]> => {
    if (!process.env.SERPAPI_KEY) {
        return [];
    }

    try {
        const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&tbm=isch&api_key=${process.env.SERPAPI_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.warn(`SerpAPI request failed with status: ${response.status}.`, await response.text());
            return [];
        }

        const data = await response.json();

        if (data.error) {
            console.warn('SerpAPI returned an error:', data.error);
            return [];
        }
        
        if (data.images_results && Array.isArray(data.images_results)) {
            return data.images_results
                .slice(0, 8) // Take the top 8 images
                .map((img: any) => ({
                    url: img.original,
                    source: img.source,
                }));
        }

        return [];
    } catch (error) {
        console.error("An error occurred while fetching images from SerpAPI:", error);
        return []; // Return empty array on any failure, preventing app crash
    }
};


const findStoryAndImages = async (topic: string): Promise<{ story: Story }> => {
  const prompt = `
    Based on the topic of interest "${topic}", use your web search tool to find the single most significant, credible, and impactful relevant news story published within the last 48 hours. You MUST consult at least 3 different credible news sources to formulate your summary.

    You do not need to find any images. For the 'realWorldImages' field in the schema, you MUST return an empty array \`[]\`.

    Your output MUST be a single, raw JSON object, without any markdown formatting, comments, or introductory text. The JSON object must conform to this schema:
    ${JSON.stringify(STORY_AND_ASSETS_SCHEMA, null, 2)}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      tools: [{googleSearch: {}}],
    },
  });

  if (!response.text) {
    throw new Error('Failed to get a valid story from the API.');
  }

  try {
    const result = JSON.parse(extractJson(response.text)) as { story: Omit<Story, 'realWorldImages'>; realWorldImages: [] };

    const imagesFromSerpApi = await fetchImagesWithSerpApi(result.story.title);

    const groundingChunksFromApi = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const validGroundingChunks = groundingChunksFromApi.reduce((acc: GroundingChunk[], chunk) => {
        if (chunk.web?.uri && chunk.web?.title) {
            acc.push({
                web: {
                    uri: chunk.web.uri,
                    title: chunk.web.title,
                }
            });
        }
        return acc;
    }, []);

    const storyWithImages: Story = {
        ...result.story,
        realWorldImages: imagesFromSerpApi,
        groundingChunks: validGroundingChunks
    };
    return { story: storyWithImages };
  } catch (e) {
      console.error("Failed to parse JSON string.", "String was:", response.text, "Original response:", response);
      throw new Error(`The AI returned malformed data. Please try again. Original response: ${response.text}`);
  }
};

const getStyleRecommendations = async (story: Story): Promise<StyleRecommendation[]> => {
  const prompt = `
    Given the following news story summary:
    "${story.summary}"

    Analyze the story and recommend the most suitable slide styles from the Style Library to create a 10-slide Instagram carousel. You must select exactly 10 styles, ensuring a varied and engaging narrative flow. Start with a strong hook ('The Spotlight') and end with a call to action ('The Closer').

    Your output MUST be a single, raw JSON object conforming to the following schema:
    ${JSON.stringify(RECOMMENDATION_SCHEMA, null, 2)}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: RECOMMENDATION_SCHEMA,
    },
  });
  
  const result = JSON.parse(extractJson(response.text));
  return result.recommendations;
};

const generateAbstractVisual = async (visualDescription: string, palette: Palette): Promise<string> => {
  if (!visualDescription || visualDescription.toLowerCase() === 'no visual needed') {
    return '';
  }

  const detailedPrompt = `Abstract 3D render, ${visualDescription}, cinematic lighting, using a color palette of ${palette.colors.primary}, ${palette.colors.secondary}, and ${palette.colors.text} on a ${palette.colors.bg} background, trending on ArtStation, hyper-detailed, photorealistic.`;
  
  const model = 'imagen-3.0-generate-002';

  try {
    console.log(`Attempting to generate image with model: ${model}`);
    const response = await ai.models.generateImages({
      model,
      prompt: detailedPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '3:4',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64Image = response.generatedImages[0].image.imageBytes;
      console.log(`Successfully generated image with model: ${model}`);
      return `data:image/png;base64,${base64Image}`;
    } else {
      console.warn(`API returned no images with model ${model}.`);
      throw new Error(`API returned no images with model ${model}.`);
    }
  } catch (error: any) {
    console.error(`Error generating image with model ${model}:`, error);
    throw new Error('Failed to generate image.');
  }
};

const generateSpokenSummary = async (summary: string): Promise<string> => {
  const prompt = `Summarize the following news story in a concise, engaging paragraph of 3-4 sentences. The tone should be informative and clear, suitable for a short audio news briefing. Do not add any introductory phrases like "Here is a summary". Just provide the summary text directly.

  Original story: "${summary}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text;
  } catch (error) {
    console.error("Failed to generate spoken summary:", error);
    return `An audio summary could not be generated. Here is the original story: ${summary}`;
  }
};


export const regenerateImageForSlide = async (visualDescription: string, palette: Palette): Promise<string> => {
  return generateAbstractVisual(visualDescription, palette);
};

export const generateInitialCarouselPlan = async (topic: string, palette: Palette, onProgress: (message: string) => void): Promise<{ story: Story, plan: CarouselPlan, spokenSummary: string }> => {
  onProgress('Searching for a top news story...');
  const { story } = await findStoryAndImages(topic);

  onProgress('Fetching real-world images...');
  const imagePromises = story.realWorldImages.map(async (img) => ({
      ...img,
      url: await imageUrlToBase64(img.url)
  }));
  const processedImages = (await Promise.all(imagePromises)).filter(img => img.url);
  const storyWithBase64Images = { ...story, realWorldImages: processedImages };
  
  onProgress('Analyzing story for slide concepts...');
  const recommendations = await getStyleRecommendations(story);
  const selectedStyles = recommendations.slice(0, 10);

  onProgress('Generating audio summary...');
  const spokenSummary = await generateSpokenSummary(story.summary);

  onProgress('Generating slide layouts...');
  const paletteJson = JSON.stringify(palette.colors);
  const prompt = `
    You are an expert visual journalist and graphic designer. Your task is to create a 10-slide Instagram carousel based on the provided story summary, brand identity, and a specific plan of slide styles. Adhere STRICTLY to all mandates.

    **STORY SUMMARY:**
    ${story.summary}

    **BRAND IDENTITY:**
    ${BRAND_IDENTITY}
    
    **USER-SELECTED PALETTE (Use these colors exclusively):**
    ${paletteJson}

    **STYLE LIBRARY (Reference for your task):**
    ${STYLE_LIBRARY}

    **ART DIRECTION & LAYOUT MANDATES:**
    ${ART_DIRECTION_GUIDELINES}

    **YOUR ASSIGNED CAROUSEL PLAN:**
    Create exactly 10 slides in this order:
    ${selectedStyles.map((r, i) => `${i + 1}. ${r.styleName}`).join('\n')}

    Now, generate the complete JSON for the carousel. For each slide, create compelling text content derived from the story summary and design a professional layout using text and shape elements. Remember to generate a 'visualDescription' for each slide that needs one, as per the rules.

    Your output MUST be a single, raw JSON object conforming to this schema:
    ${JSON.stringify(CAROUSEL_SCHEMA, null, 2)}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: CAROUSEL_SCHEMA,
    },
  });

  const planResult = JSON.parse(extractJson(response.text)) as CarouselPlan;

  onProgress('Generating abstract visuals...');
  
  const slidesWithIds = planResult.slides.map(slide => ({
      ...slide,
      id: crypto.randomUUID(),
      elements: slide.elements.map(el => ({
        ...el,
        id: crypto.randomUUID()
      }))
  }));

  const imageGenerationPromises = slidesWithIds.map(slide => {
      if (slide.visualDescription && slide.visualDescription.toLowerCase() !== 'no visual needed') {
          return generateAbstractVisual(slide.visualDescription, palette);
      }
      return Promise.resolve(''); // No image for this slide
  });
  
  const imageUrls = await Promise.all(imageGenerationPromises);

  const finalPlan: CarouselPlan = {
    slides: slidesWithIds.map((slide, index) => ({
      ...slide,
      imageUrl: imageUrls[index],
      isImageVisible: slide.styleName === 'The Spotlight',
    }))
  };
  
  onProgress('Done!');
  return { story: storyWithBase64Images, plan: finalPlan, spokenSummary };
};

export const removeImageBackground = async (base64ImageData: string): Promise<string> => {
    // Access the background removal function from the window object provided by the CDN script.
    // This check prevents a race condition where the function is called before the script has loaded.
    if (!(window as any).imglyRemoveBackground) {
        console.error("Background removal failed:", "imglyRemoveBackground is not defined");
        throw new Error("Failed to remove background: The 'imglyRemoveBackground' library is not defined. It may have failed to load.");
    }

    try {
        const blob = await (await fetch(base64ImageData)).blob();
        
        const config = {
          // publicPath is required for the library to load its ONNX models
          publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal/dist/assets/'
        };

        const resultBlob = await (window as any).imglyRemoveBackground.removeBackground(blob, config);
        
        // Convert the resulting Blob back to a base64 data URL
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(resultBlob);
        });

    } catch (error) {
        console.error("Error removing image background:", error);
        throw new Error(`Failed to remove background. ${error instanceof Error ? error.message : String(error)}`);
    }
};