# 🚀 FeedNexus
<div align="center">
<img width="1200" height="475" alt="Banner" src="https://github.com/FelixMatrixar/FeedNexus/blob/main/gifs/FeedNexus%20Banner.png" />
</div>

---

## What I Built

### The Problem

<div align="center">
<img width="1200" height="475" alt="MemeProblem" src="https://github.com/FelixMatrixar/FeedNexus/blob/main/gifs/spongebob%20smile%20at%20squidward.gif" />
</div>

In today's fast-paced digital landscape, news breaks instantly, but creating high-quality, visually-consistent social media content is slow and labor-intensive. Content creators and newsrooms face a constant struggle:

* **The Speed Gap:** There is a significant delay between a story breaking and the publication of an engaging, well-designed visual asset. By the time a carousel is manually created, the conversation may have already moved on.
* **Creative Burnout:** Journalists and social media managers spend hours on repetitive, manual tasks—summarizing articles, finding visuals, formatting text, and ensuring brand compliance—instead of focusing on high-level storytelling and community engagement.
* **Brand Inconsistency:** Across a team, maintaining a cohesive visual identity for every post is a major challenge, often leading to a fragmented and unprofessional social media presence.
* **The Quality vs. Quantity Dilemma:** Teams are often forced to choose between producing content *quickly* or producing content that is *high-quality*. Doing both consistently is nearly impossible without a better workflow.

### The Solution

**FeedNexus** is an AI-powered co-pilot designed to eliminate this bottleneck. It serves as an intelligent assistant that automates the most time-consuming parts of the creative workflow, allowing creators to bridge the gap between raw information and a polished, ready-to-publish visual story in minutes, not hours.

Here's how it works:

* **📰 Story Discovery & Synthesis:** Provide a topic (e.g., "AI and Technology"), and FeedNexus finds the most significant, credible news story from the last 48 hours. It synthesizes information into a concise, cited summary.

* **📜 Narrative Structuring:** The AI drafts a compelling 10-slide narrative using a library of proven slide archetypes, like "The Spotlight" for a powerful hook or "The Data Flash" for a key statistic.

* **🎨 Visual Generation & Branding:** For each slide, FeedNexus generates a unique, *abstract* visual that metaphorically represents the content, guided by a dynamically suggested, context-aware color palette to ensure every asset is brand-aligned.

* **✍️ Interactive Editing & Finalizing:** The AI's draft is presented in a fully interactive editor. Refine text, reposition elements, regenerate visuals, or drag-and-drop real-world images. When ready, export the entire package as a zip file, ready for publishing.

---

## 🎬 Demo

Check out a live walkthrough of FeedNexus in action:

<br>

[DEMO](https://youtu.be/v_Ydc0wBj_w)

<br>

---

## 🛠️ How I Used the Gemini API

The Gemini API is the engine behind FeedNexus's core intelligence. I leveraged several advanced features to create a seamless workflow from broad concepts to structured, multimodal content.

**1. News Aggregation & Grounding (`gemini-2.5-flash` with Google Search)**
To ensure content is timely and credible, FeedNexus uses Gemini with the `googleSearch` tool. The model performs real-time searches, grounding its summary in verifiable facts and providing source links—critical for maintaining journalistic standards.

**2. Structured Content Generation (`gemini-2.5-flash` with JSON Mode)**
To translate a news summary into a full carousel layout, I defined a rigorous `responseSchema`. The AI is prompted to populate this schema, detailing the `styleName` for each slide, the `visualDescription` for the image generator, and an array of `elements` with precise coordinates and styling. This guarantees the AI's output is perfectly rendered by the application.

**3. Metaphorical Visual Creation (`imagen-3.0-generate-002`)**
To create a unique visual identity, FeedNexus uses the `generateImages` functionality. The art direction mandates that these visuals must be **metaphorical and abstract**, resulting in a sophisticated aesthetic that avoids generic stock imagery.

**4. Audio Briefing Generation (`gemini-2.5-flash`)**
For accessibility, FeedNexus generates a concise script for an audio summary. This text is then passed to the browser's native Web Speech API to be synthesized into voice, providing a "listenable" version of the news.

---

## ✨ Multimodal Features

FeedNexus is fundamentally multimodal, designed to understand, process, and generate content across text, structured data, and images.

* **Text-to-JSON-to-Image Pipeline:** The core workflow is a powerful demonstration of multimodal translation. It takes unstructured text (news articles), transforms it into structured JSON data (the carousel plan), which in turn provides the prompts to generate the final visual slides.

* **Blending Factual & Abstract Imagery:** The editor allows users to seamlessly blend two visual modalities. Use the AI's abstract art for a cover slide, then drag a real-world, cited photo onto a "Key Players" slide. The final product is both emotionally resonant and factually grounded.

* **Content and Layout Co-generation:** The AI doesn't just write text; it designs the layout simultaneously. It decides a piece of information is best represented as a "Data Flash" and styles it accordingly, ensuring the design always serves the content.

---

## 🎨 Techniques in Content Design

FeedNexus employs several sophisticated techniques to ensure the generated content is effective, engaging, and journalistically sound.

* **Dynamic, Context-Aware Branding:** The AI analyzes the mood and context of the news story to suggest a thematically appropriate color palette—for instance, sober blues and grays for political analysis, or vibrant, energetic tones for a story on innovation. The chosen palette's hex codes are then programmatically injected into the image generation prompts, ensuring the resulting abstract visuals are perfectly and smoothly color-matched to the brand theme.

* **Hook-Driven Narrative Structure:** The AI is instructed to *always* begin with "The Spotlight" style to immediately grab the viewer's attention and maximize retention.

* **Visual Scaffolding with a Style Library:** Instead of giving the AI complete freedom, it selects from a curated "Style Library" of 12 proven slide archetypes, ensuring every carousel follows a logical and engaging flow.

* **Metaphorical Abstraction in Art Direction:** A core principle is the avoidance of literal imagery. This results in a unique visual brand that captures the *mood* and *implications* of a story.

* **Strict Typographic and Brand Hierarchy:** The AI operates under defined brand guidelines (colors, fonts), saving creators the tedious task of manual formatting.

* **Data-Driven Storytelling:** The AI is trained to map key data, comparisons, or quotes to specific slide styles, transforming dry information into compelling narrative beats.

* **Human-in-the-Loop Refinement:** The AI's output is treated as a "first draft." The interactive editor empowers the journalist to be the final arbiter of the story, blending the speed of automation with the nuance and ethical oversight of a human editor.

---

## 🧰 The 12 Slide Archetypes: Your Storytelling Toolkit

FeedNexus uses a library of 12 distinct slide styles, allowing the AI to construct a varied and compelling narrative for any news story.

* **The Spotlight:** The hero slide. A powerful, full-bleed visual and a bold headline to act as the primary hook.
* **The Analyst:** The breakdown. Presents key takeaways or facts in a clean, digestible bulleted list.
* **The Visionary Quote:** The human element. Highlights a powerful quote from a key person involved in the story.
* **The Data Flash:** The big number. An ultra-minimalist slide that showcases a single, impactful statistic.
* **The Versus Slide:** The comparison. A split-screen layout to compare two opposing ideas, entities, or outcomes.
* **The Timeline:** The context. A sequential overview of key dates and events that led to the current news.
* **The Key Players:** The "who." Introduces the main people or organizations involved with headshots or logos.
* **The Map:** The geographic view. A stylized map graphic that highlights the location(s) where the news is happening.
* **The Pros & Cons:** The balanced take. A two-column layout to explore the positive and negative implications.
* **The Process:** The "how." A step-by-step flowchart that explains a complex process or workflow.
* **The Question:** The engagement prompt. A slide designed to pose a direct question to the audience to spark discussion.
* **The Closer:** The call-to-action. A branded sign-off slide that encourages users to follow, save, and share.

---

## 👥 Project Contributors

| Name         | Role                | Instagram                                                 | LinkedIn                                                           |
| :----------- | :------------------ | :---------------------------------------------------------- | :----------------------------------------------------------------- |
| **Felix** | Project Lead        | [@felix\_rngg](https://www.instagram.com/felix_rngg)          | [felix-mneuro](https://www.linkedin.com/in/felix-mneuro/)          |
| **Christie** | Backend Developer   | [@christieteydaddy](https://www.instagram.com/christieteydaddy/) | [christie-1a14b610b](https://www.linkedin.com/in/christie-1a14b610b/) |

Reach out to us!
<div align="center">
<img width="1200" height="475" alt="LetsConnect" src="https://github.com/FelixMatrixar/FeedNexus/blob/main/gifs/carrying%20patrick.gif" />
</div>
