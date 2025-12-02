export interface AIContext {
  currentScene: string;
  characters: string[];
  location: string;
  keyTerms: string[];
  background: string;
}

export interface GeminiConfig {
  apiKey: string;
}

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export class GeminiService {
  private apiKey: string;

  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey;
  }

  async generateContext(
    selectedText: string,
    chapterText: string
  ): Promise<AIContext> {
    const prompt = this.buildPrompt(selectedText, chapterText);

    try {
      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No response from Gemini API');
      }

      return this.parseResponse(generatedText);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  private buildPrompt(selectedText: string, chapterText: string): string {
    return `You are a literary analysis assistant. A reader has highlighted the following text from a book:

HIGHLIGHTED TEXT:
"${selectedText}"

FULL CHAPTER CONTEXT:
${chapterText.substring(0, 8000)} ${chapterText.length > 8000 ? '...(truncated)' : ''}

Based on the highlighted text and the surrounding chapter context, provide a comprehensive analysis in the following JSON format:

{
  "currentScene": "Brief description of what is immediately happening in the story at this moment (2-3 sentences)",
  "characters": ["List of characters present or mentioned in the current scene"],
  "location": "Description of the current location or setting",
  "keyTerms": ["Important terms, concepts, or references that need explanation"],
  "background": "Relevant background information that helps understand the highlighted text and current scene (3-4 sentences)"
}

Respond ONLY with valid JSON. Do not include any markdown formatting or code blocks.`;
  }

  private parseResponse(responseText: string): AIContext {
    try {
      console.log('Raw Gemini response:', responseText);

      // Remove markdown code blocks if present
      let cleanedText = responseText.trim();

      // Remove markdown code blocks (various formats)
      cleanedText = cleanedText.replace(/```json\s*/g, '');
      cleanedText = cleanedText.replace(/```\s*/g, '');
      cleanedText = cleanedText.trim();

      // Try to extract JSON object from the text
      // Look for the first { and last }
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
      }

      console.log('Cleaned text for parsing:', cleanedText);

      // Try to fix common JSON issues
      // Remove trailing commas before closing brackets
      cleanedText = cleanedText.replace(/,(\s*[}\]])/g, '$1');

      const parsed = JSON.parse(cleanedText);

      return {
        currentScene: parsed.currentScene || 'No scene information available',
        characters: Array.isArray(parsed.characters) ? parsed.characters : [],
        location: parsed.location || 'Unknown location',
        keyTerms: Array.isArray(parsed.keyTerms) ? parsed.keyTerms : [],
        background: parsed.background || 'No background information available',
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      console.error('Response text:', responseText);

      // Try to extract information from non-JSON response as a last resort
      // This is a fallback for when JSON parsing completely fails
      return this.extractFromPlainText(responseText);
    }
  }

  private extractFromPlainText(text: string): AIContext {
    // Fallback parser for plain text responses
    console.log('Attempting to extract from plain text');

    return {
      currentScene: 'AI analysis available. Please check the console for the raw response.',
      characters: [],
      location: 'Unknown',
      keyTerms: [],
      background: text.substring(0, 500), // Show first 500 chars of raw response
    };
  }
}

// Singleton instance
let geminiServiceInstance: GeminiService | null = null;

export const initGeminiService = (config: GeminiConfig) => {
  geminiServiceInstance = new GeminiService(config);
};

export const getGeminiService = (): GeminiService => {
  if (!geminiServiceInstance) {
    throw new Error('Gemini service not initialized. Call initGeminiService first.');
  }
  return geminiServiceInstance;
};
