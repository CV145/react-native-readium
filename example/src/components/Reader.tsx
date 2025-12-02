import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Platform, DimensionValue, TouchableOpacity } from 'react-native';
import {
  ReadiumView,
} from 'react-native-readium';
import type { Link, Locator, File, ReadiumProps } from 'react-native-readium';
import { Icon } from '@rneui/themed';

import RNFS from '../utils/RNFS';
import {
  EPUB_URL,
  EPUB_PATH,
  INITIAL_LOCATION,
} from '../consts';
import { ReaderButton } from './ReaderButton';
import { TableOfContents } from './TableOfContents';
import { PreferencesEditor } from './PreferencesEditor';
import { AIContextPanel } from './AIContextPanel';
import { useTextSelection } from '../hooks/useTextSelection';
import { initGeminiService, getGeminiService, type AIContext } from '../services/geminiService';
import { extractChapterTextWithRetry } from '../utils/chapterExtractor';
import { GEMINI_CONFIG, isGeminiConfigured } from '../config/gemini';

export const Reader: React.FC = () => {
  const [toc, setToc] = useState<Link[] | null>([]);
  const [file, setFile] = useState<File>();
  const [location, setLocation] = useState<Locator | Link>();
  const [preferences, setPreferences] = useState<ReadiumProps['preferences']>({
    theme: 'dark',
  });
  const ref = useRef<any>(undefined);

  // AI Context state
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiContext, setAIContext] = useState<AIContext | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAIError] = useState<string | null>(null);
  const [selectedTextForAI, setSelectedTextForAI] = useState<string>('');

  // Text selection hook (only enabled on web)
  const { selection, clearSelection } = useTextSelection(Platform.OS === 'web');

  // Initialize Gemini service
  useEffect(() => {
    if (Platform.OS === 'web' && isGeminiConfigured()) {
      initGeminiService(GEMINI_CONFIG);
    }
  }, []);

  // Handle AI analysis
  const handleGenerateAIContext = useCallback(async () => {
    if (!selection || !selection.text) {
      return;
    }

    if (!isGeminiConfigured()) {
      setAIError('Gemini API key not configured. Please check src/config/gemini.ts');
      setShowAIPanel(true);
      return;
    }

    setSelectedTextForAI(selection.text);
    setShowAIPanel(true);
    setIsLoadingAI(true);
    setAIError(null);
    setAIContext(null);

    try {
      // Extract chapter text
      const chapterText = await extractChapterTextWithRetry();

      if (!chapterText) {
        throw new Error('Could not extract chapter text. Please try again.');
      }

      // Call Gemini API
      const geminiService = getGeminiService();
      const context = await geminiService.generateContext(selection.text, chapterText);

      setAIContext(context);
    } catch (error) {
      console.error('Error generating AI context:', error);
      setAIError(error instanceof Error ? error.message : 'An error occurred while generating context');
    } finally {
      setIsLoadingAI(false);
    }
  }, [selection]);

  const handleCloseAIPanel = useCallback(() => {
    setShowAIPanel(false);
    setAIContext(null);
    setAIError(null);
    setSelectedTextForAI('');
    clearSelection();
  }, [clearSelection]);

  useEffect(() => {
    async function run() {

      if (Platform.OS === 'web') {
        setFile({
          url: EPUB_URL,
          initialLocation: INITIAL_LOCATION,
        });
      } else {
        const exists = await RNFS.exists(EPUB_PATH);
        if (!exists) {
          console.log(`Downloading file: '${EPUB_URL}'`);
          const { promise } = RNFS.downloadFile({
            fromUrl: EPUB_URL,
            toFile: EPUB_PATH,
            background: true,
            discretionary: true,
          });

          // wait for the download to complete
          await promise;
        } else {
          console.log('File already exists. Skipping download.');
        }

        setFile({
          url: EPUB_PATH,
          initialLocation: INITIAL_LOCATION,
        });
      }
    }

    run();
  }, []);

  if (file) {
    return (
      <View style={styles.container}>
        <View style={styles.controls}>
          <View style={styles.button}>
            <TableOfContents
              items={toc}
              onPress={(loc) => setLocation({
                href: loc.href,
                type: 'application/xhtml+xml',
                title: loc.title || '',
              })}
            />
          </View>
          <View style={styles.button}>
            <PreferencesEditor
              preferences={preferences}
              onChange={setPreferences}
            />
          </View>
          {Platform.OS === 'web' && (
            <View style={styles.button}>
              <TouchableOpacity
                onPress={handleGenerateAIContext}
                disabled={!selection || !selection.text}
                style={[
                  styles.aiButton,
                  (!selection || !selection.text) && styles.aiButtonDisabled,
                ]}
              >
                <Icon
                  name="psychology"
                  size={24}
                  color={(!selection || !selection.text) ? '#666' : '#4A90E2'}
                />
                <Text style={[
                  styles.aiButtonText,
                  { marginLeft: 8 },
                  (!selection || !selection.text) && styles.aiButtonTextDisabled,
                ]}>
                  AI Context
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.reader}>
          {Platform.OS === 'web' ? (
            <ReaderButton
              name="chevron-left"
              style={{ width: '10%' }}
              onPress={() => ref.current?.prevPage()}
            />
          ) : null}
          <View style={styles.readiumContainer}>
            <ReadiumView
              ref={ref}
              file={file}
              location={location}
              preferences={preferences}
              onLocationChange={(locator: Locator) => setLocation(locator)}
              onTableOfContents={(toc: Link[] | null) => {
                if (toc) {setToc(toc);}
              }}
            />
          </View>
          {Platform.OS === 'web' ? (
            <ReaderButton
              name="chevron-right"
              style={{ width: '10%' }}
              onPress={() => ref.current?.nextPage()}
            />
          ) : null}
        </View>

        {/* AI Context Panel */}
        {Platform.OS === 'web' && (
          <AIContextPanel
            visible={showAIPanel}
            selectedText={selectedTextForAI}
            context={aiContext}
            isLoading={isLoadingAI}
            error={aiError}
            onClose={handleCloseAIPanel}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>downloading file</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: (Platform.OS === 'web' ? '100vh' : '100%') as DimensionValue,
  },
  reader: {
    flexDirection: 'row',
    width: '100%',
    height: '90%',
  },
  readiumContainer: {
    width: Platform.OS === 'web' ? '80%' : '100%',
    height: '100%',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  button: {
    margin: 10,
  },
  aiButton: {
    flexDirection: 'row' as 'row',
    alignItems: 'center' as 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2d2d2d',
  },
  aiButtonDisabled: {
    opacity: 0.5,
  },
  aiButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  aiButtonTextDisabled: {
    color: '#666',
  },
});
