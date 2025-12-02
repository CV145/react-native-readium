# AI Context Feature - Documentation

## Overview

This feature allows you to highlight text from any book in the eReader and generate contextual information using Google's Gemini 2.5 Flash AI model. The AI analyzes the selected text within the context of the current chapter and provides:

- **Current Scene**: What's immediately happening in the story
- **Characters**: Characters present or mentioned in the current scene
- **Location**: The current setting or location
- **Key Terms**: Important concepts, references, or terms that need explanation
- **Background**: Relevant background information to understand the context

## Setup Instructions

### 1. Get a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the generated API key

### 2. Configure the API Key

Open the file `/example/src/config/gemini.ts` and replace the placeholder with your API key:

```typescript
export const GEMINI_CONFIG = {
  apiKey: 'YOUR_ACTUAL_GEMINI_API_KEY_HERE',
};
```

Alternatively, you can set it as an environment variable:

```bash
export REACT_APP_GEMINI_API_KEY='your-api-key-here'
```

### 3. Run the Application

The application should already be running. If not, start it with:

```bash
cd example
yarn web:start
```

Open your browser to `http://localhost:3000`

## How to Use

### Step 1: Select Text

1. Read the book in the eReader
2. Use your mouse to highlight any text you want to learn more about
3. The text selection will be captured automatically

### Step 2: Generate AI Context

1. After selecting text, look for the "AI Context" button in the top-right controls
2. The button will be enabled (blue) when text is selected
3. Click the "AI Context" button

### Step 3: View AI Analysis

A modal panel will appear showing:

- Your selected text (highlighted)
- AI-generated analysis with:
  - Current scene description
  - Characters in the scene
  - Current location
  - Key terms to understand
  - Relevant background information

### Step 4: Close the Panel

- Click the X button in the top-right corner of the panel
- Or click outside the panel to close it

## Features

### Automatic Chapter Context Extraction

The system automatically extracts the full text of the current chapter you're reading. This provides the AI with enough context to give accurate and relevant information about your selected text.

### Intelligent Analysis

Gemini 2.5 Flash analyzes:
- The immediate context around your selection
- Character relationships and mentions
- Location and setting details
- Important terms or concepts
- Historical or background information relevant to understanding the scene

### Beautiful UI

The AI Context panel features:
- Dark theme matching the reader
- Color-coded sections with icons
- Tag-based display for characters and key terms
- Loading states and error handling
- Responsive design

## Troubleshooting

### "API key not configured" Error

**Solution**: Make sure you've replaced `'YOUR_GEMINI_API_KEY_HERE'` in `/example/src/config/gemini.ts` with your actual API key.

### "Could not extract chapter text" Error

**Solution**:
- Wait a few seconds for the chapter to fully load before selecting text
- Try refreshing the page
- Make sure you're on a valid book page

### API Rate Limiting

Gemini API has rate limits based on your plan:
- Free tier: 15 requests per minute
- If you hit the limit, wait a minute before trying again

### Selection Not Working

**Solution**:
- Make sure you're using the web version (not native iOS/Android)
- Try selecting text again - make sure to drag across the text
- Check browser console for any errors

## Technical Details

### Files Created/Modified

New files:
- `/example/src/hooks/useTextSelection.ts` - Text selection hook
- `/example/src/services/geminiService.ts` - Gemini API integration
- `/example/src/components/AIContextPanel.tsx` - UI component for displaying AI analysis
- `/example/src/utils/chapterExtractor.ts` - Chapter text extraction utility
- `/example/src/config/gemini.ts` - Configuration file

Modified files:
- `/example/src/components/Reader.tsx` - Integrated AI context feature

### API Usage

The feature uses the Gemini 2.0 Flash Exp model:
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`
- Temperature: 0.7 (balanced creativity and accuracy)
- Max tokens: 1000 (sufficient for detailed analysis)
- Context limit: ~8000 characters from the current chapter

### Privacy & Data

- Your API key is stored locally in your configuration file
- Selected text and chapter content are sent to Google's Gemini API for analysis
- No data is stored or cached by the application
- Each analysis is a fresh API call

## Limitations

- **Web only**: This feature currently only works in the web version of the app
- **Internet required**: Requires an active internet connection to call the Gemini API
- **API costs**: While Gemini has a generous free tier, high usage may incur costs
- **Chapter-based context**: The AI only sees the current chapter, not the entire book
- **Language**: Works best with English text, though Gemini supports multiple languages

## Future Enhancements

Potential improvements:
- Save and bookmark AI analyses
- Export analyses to notes
- Support for iOS and Android native platforms
- Customizable AI prompts
- Analysis history
- Multi-chapter context for better continuity

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key is correct
3. Ensure you have a stable internet connection
4. Check Gemini API status at [status.google.com](https://status.google.com)

## Credits

- Built with React Native Web
- Powered by Google Gemini 2.5 Flash
- Uses @d-i-t-a/reader for EPUB rendering
