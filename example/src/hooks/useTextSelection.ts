import { useEffect, useState, useCallback } from 'react';

export interface TextSelection {
  text: string;
  chapterHref: string;
  chapterTitle: string;
}

export const useTextSelection = (enabled: boolean = true) => {
  const [selection, setSelection] = useState<TextSelection | null>(null);

  const handleSelectionChange = useCallback(() => {
    if (!enabled) return;

    let selectedText = '';
    let chapterHref = '';
    let chapterTitle = 'Current Chapter';

    // First try to get selection from the iframe (where the book content is)
    const iframe = document.querySelector('#iframe-wrapper iframe') as HTMLIFrameElement;

    if (iframe) {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        const iframeWindow = iframe.contentWindow;

        if (iframeWindow && iframeDoc) {
          // Get selection from inside the iframe
          const iframeSelection = iframeWindow.getSelection();
          selectedText = iframeSelection?.toString().trim() || '';

          // Get chapter info
          chapterHref = iframe.src || '';
          chapterTitle = iframeDoc.title || 'Current Chapter';

          console.log('Iframe selection detected:', selectedText);
        }
      } catch (e) {
        console.warn('Could not access iframe content:', e);
      }
    }

    // Fallback: try main window selection
    if (!selectedText) {
      selectedText = window.getSelection()?.toString().trim() || '';
      console.log('Main window selection:', selectedText);
    }

    if (selectedText && selectedText.length > 0) {
      console.log('Setting selection:', selectedText);
      setSelection({
        text: selectedText,
        chapterHref,
        chapterTitle,
      });
    } else {
      // Clear selection if no text is selected
      setSelection(null);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Listen for mouseup event to capture selection
    const handleMouseUp = () => {
      setTimeout(handleSelectionChange, 150);
    };

    // Add listener to main document
    document.addEventListener('mouseup', handleMouseUp);

    // Track added event listeners to avoid duplicates
    const addedListeners = new Set<Document>();

    // Function to add listeners to iframe
    const addIframeListeners = () => {
      const iframe = document.querySelector('#iframe-wrapper iframe') as HTMLIFrameElement;
      if (iframe) {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc && !addedListeners.has(iframeDoc)) {
            console.log('Adding event listener to iframe');
            iframeDoc.addEventListener('mouseup', handleMouseUp);
            iframeDoc.addEventListener('selectionchange', handleSelectionChange);
            addedListeners.add(iframeDoc);
          }
        } catch (e) {
          console.warn('Could not add event listener to iframe:', e);
        }
      }
    };

    // Try to add iframe listeners immediately
    addIframeListeners();

    // Also check periodically for new iframes (when page changes)
    const checkIframe = setInterval(addIframeListeners, 2000);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      clearInterval(checkIframe);

      // Clean up iframe listeners
      addedListeners.forEach((doc) => {
        doc.removeEventListener('mouseup', handleMouseUp);
        doc.removeEventListener('selectionchange', handleSelectionChange);
      });
    };
  }, [enabled, handleSelectionChange]);

  const clearSelection = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  return { selection, clearSelection };
};
