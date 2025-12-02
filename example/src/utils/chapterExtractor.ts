/**
 * Extracts the text content from the current chapter being displayed in the reader
 */
export const extractChapterText = (): string => {
  try {
    // Try to find the iframe containing the book content
    const iframe = document.querySelector('#iframe-wrapper iframe') as HTMLIFrameElement;

    if (!iframe) {
      console.warn('Could not find reader iframe');
      return '';
    }

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDoc) {
      console.warn('Could not access iframe document');
      return '';
    }

    // Try to extract text from the body
    const body = iframeDoc.body;
    if (!body) {
      console.warn('Could not find body in iframe');
      return '';
    }

    // Get all text content from the body, excluding script and style tags
    const clonedBody = body.cloneNode(true) as HTMLElement;

    // Remove script and style elements
    const scriptsAndStyles = clonedBody.querySelectorAll('script, style');
    scriptsAndStyles.forEach((el) => el.remove());

    // Get text content
    const text = clonedBody.innerText || clonedBody.textContent || '';

    return text.trim();
  } catch (error) {
    console.error('Error extracting chapter text:', error);
    return '';
  }
};

/**
 * Attempts to extract chapter text with retry logic
 * Useful for cases where the iframe content might not be fully loaded
 */
export const extractChapterTextWithRetry = async (
  maxRetries: number = 3,
  delayMs: number = 500
): Promise<string> => {
  for (let i = 0; i < maxRetries; i++) {
    const text = extractChapterText();

    if (text.length > 0) {
      return text;
    }

    // Wait before retrying
    if (i < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error('Could not extract chapter text after multiple attempts');
};
