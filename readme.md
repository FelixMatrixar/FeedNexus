# FeedNexus

**AI generates the first draft. You perfect the final story.**

---

## What I Built

FeedNexus is an AI-powered co-pilot designed for visual journalists, social media managers, and content creators. It addresses a significant bottleneck in the digital newsroom: the slow, manual process of transforming developing news stories into engaging, visually consistent social media carousels for platforms like Instagram.

The application serves as an intelligent assistant that automates the most time-consuming parts of the creative workflow:

1.  **Story Discovery & Synthesis:** A user provides a broad topic of interest (e.g., "AI and Technology"). FeedNexus uses the Gemini API with Google Search grounding to find the single most significant, credible news story on that topic from the last 48 hours. It synthesizes information from multiple sources into a concise summary, providing citations for journalistic integrity.

2.  **Narrative Structuring:** Based on the story's content, the AI drafts a compelling 10-slide narrative using a library of proven, effective slide styles (e.g., "The Spotlight" for a hook, "The Data Flash" for a key statistic, "The Closer" for a call-to-action).

3.  **Visual Generation & Branding:** For each slide, FeedNexus generates a unique, abstract visual that metaphorically represents the content. This is guided by a strict set of art direction principles and a user-selected color palette, ensuring every asset is brand-aligned and aesthetically cohesive.

4.  **Interactive Editing & Finalizing:** The AI-generated draft is presented in a fully interactive, in-browser editor. Journalists can refine text, reposition elements, regenerate visuals, or even drag-and-drop real-world images onto the slides. Once satisfied, they can export the entire package—including all slide images and a written summary—as a single zip file, ready for publishing.

FeedNexus bridges the gap between raw information and a polished, ready-to-publish visual story, drastically reducing production time while enhancing creative quality.

## Demo

Check out a live walkthrough of FeedNexus in action:

[Watch the Demo on YouTube](https://www.youtube.com/watch?v=dQw4w9WgXcQ) <!-- Placeholder YouTube Link -->

**Screenshots:**

*Coming soon: Screenshots of the topic input, loader, and interactive editor will be placed here.*

## How I Used the Gemini API

The Gemini API is the engine behind FeedNexus's core functionality. I leveraged several advanced features to create a seamless and intelligent workflow, moving from broad concepts to structured, multimodal content.

1.  **News Aggregation & Grounding (`gemini-2.5-flash` with Google Search)**
    *   To ensure the content is timely and credible, FeedNexus uses Gemini with the `googleSearch` tool. When a user enters a topic, the model performs a real-time web search to find the most relevant news, grounding its summary in verifiable facts and providing source links directly in the UI. This is critical for maintaining journalistic standards.

2.  **Structured Content Generation (`gemini-2.5-flash` with JSON Mode)**
    *   The most complex task is translating a news summary into a full carousel layout. I achieved this by defining a rigorous `responseSchema`. The AI is prompted to populate this schema, which details every aspect of the 10-slide plan: the chosen `styleName` for each slide, the `visualDescription` prompt for the image generator, and an array of `elements` (text, shapes) with precise coordinates, dimensions, and styling that adheres to the selected brand palette. This ensures the AI's output is always machine-readable and can be rendered perfectly by the application.

3.  **Metaphorical Visual Creation (`imagen-3.0-generate-002`)**
    *   To create a unique visual identity, FeedNexus uses the `generateImages` functionality. The `visualDescription` prompts generated in the previous step are passed to the Imagen model. The art direction mandates that these visuals must be *metaphorical and abstract*, resulting in a sophisticated and consistent aesthetic that avoids generic stock imagery.

4.  **Audio Briefing Generation (`gemini-2.5-flash`)**
    *   For accessibility and deeper engagement, FeedNexus generates a concise script for a 3-4 sentence audio summary of the story. This text is then passed to the browser's native Web Speech API to be synthesized into voice, providing users with a "listenable" version of the news.

## Multimodal Features

FeedNexus is fundamentally multimodal, designed to understand, process, and generate content across text, structured data, and images.

-   **Text-to-JSON-to-Image Pipeline:** The core workflow is a powerful demonstration of multimodal translation. The application takes unstructured text (news articles found via search), transforms it into highly structured JSON data (the carousel plan), which in turn provides the specific text and image prompts needed to generate the final visual slides. This pipeline shows a deep understanding of content and its representation in different forms.

-   **Blending Factual & Abstract Imagery:** The user experience is built around a multimodal choice. The AI provides abstract, metaphorical art that captures the *feeling* of a story. Simultaneously, the app uses an external API (SerpAPI) to find real-world photos related to the story. In the interactive editor, the user can seamlessly blend these two visual modalities—using AI art for the cover slide and then dragging a real-world photo onto a "Key Players" slide, for example. This allows the final product to be both emotionally resonant and factually grounded.

-   **Content and Layout Co-generation:** Unlike traditional tools where text and layout are separate, FeedNexus's AI model generates them simultaneously. It decides that a particular piece of information is best represented as a "Data Flash" slide and designs the layout with a huge font size accordingly. This holistic approach ensures that the design always serves the content, creating a more impactful and readable final product.

## Techniques in Content Design

FeedNexus employs several sophisticated techniques to ensure the generated content is not just automated, but also effective, engaging, and journalistically sound.

-   **Hook-Driven Narrative Structure:** The AI is instructed to always begin the 10-slide carousel with "The Spotlight" style. This journalistic principle ensures the story immediately grabs the viewer's attention with the most impactful headline and visual, maximizing audience retention from the very first slide.

-   **Visual Scaffolding with a Style Library:** Instead of giving the AI complete freedom, which can lead to inconsistent results, FeedNexus provides a curated "Style Library" of 12 proven slide archetypes. The AI's task is to act as a visual editor, selecting the best style to present each part of the story's narrative arc. This scaffolding ensures every carousel follows a logical and engaging flow.

-   **Metaphorical Abstraction in Art Direction:** A core design principle is the avoidance of generic or literal imagery. The AI is mandated to generate `visualDescription` prompts that are abstract and metaphorical. This results in a unique, sophisticated visual brand identity that captures the *mood* and *implications* of a news story rather than just illustrating it literally.

-   **Strict Typographic and Brand Hierarchy:** The AI operates under a strict set of brand guidelines, including a defined color palette and typographic rules (e.g., Montserrat for headlines, Open Sans for body). This ensures that every piece of generated content is instantly brand-aligned, saving creators the tedious task of manual formatting.

-   **Data-Driven Storytelling:** The AI is trained to recognize key data points, comparisons, or quotes within the source material and map them to specific slide styles like "The Data Flash," "The Versus Slide," or "The Visionary Quote." This technique transforms dry information into visually compelling and easily digestible narrative beats.

-   **Human-in-the-Loop Refinement:** The final and most critical technique is that the AI's output is treated as a "first draft," not the final product. The interactive editor empowers the journalist to be the final arbiter of the story, allowing them to accept, reject, or refine every AI-generated element. This co-pilot model blends the speed of automation with the nuance and ethical oversight of a human editor.

## Project Contributors

-   **Felix** - Project Lead
    -   Instagram: [@felix_rngg](https://www.instagram.com/felix_rngg)
    -   LinkedIn: [felix-mneuro](https://www.linkedin.com/in/felix-mneuro/)
-   **Christie** - Backend Developer
    -   Instagram: [@christieteydaddy](https://www.instagram.com/christieteydaddy/)
    -   LinkedIn: [christie-1a14b610b](https://www.linkedin.com/in/christie-1a14b610b/)
