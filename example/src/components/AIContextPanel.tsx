import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Icon } from '@rneui/themed';
import type { AIContext } from '../services/geminiService';

interface AIContextPanelProps {
  visible: boolean;
  selectedText: string;
  context: AIContext | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

export const AIContextPanel: React.FC<AIContextPanelProps> = ({
  visible,
  selectedText,
  context,
  isLoading,
  error,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.panel}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AI Context Analysis</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Selected Text */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Selected Text</Text>
              <View style={styles.highlightBox}>
                <Text style={styles.selectedText}>"{selectedText}"</Text>
              </View>
            </View>

            {/* Loading State */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={styles.loadingText}>Analyzing with AI...</Text>
              </View>
            )}

            {/* Error State */}
            {error && (
              <View style={styles.errorContainer}>
                <Icon name="error-outline" size={40} color="#E74C3C" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* AI Context */}
            {context && !isLoading && !error && (
              <>
                {/* Current Scene */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon name="movie" size={20} color="#4A90E2" />
                    <Text style={styles.sectionTitle}>Current Scene</Text>
                  </View>
                  <Text style={styles.sectionContent}>{context.currentScene}</Text>
                </View>

                {/* Characters */}
                {context.characters.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Icon name="people" size={20} color="#4A90E2" />
                      <Text style={styles.sectionTitle}>Characters</Text>
                    </View>
                    <View style={styles.tagContainer}>
                      {context.characters.map((character, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{character}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Location */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon name="place" size={20} color="#4A90E2" />
                    <Text style={styles.sectionTitle}>Location</Text>
                  </View>
                  <Text style={styles.sectionContent}>{context.location}</Text>
                </View>

                {/* Key Terms */}
                {context.keyTerms.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Icon name="book" size={20} color="#4A90E2" />
                      <Text style={styles.sectionTitle}>Key Terms</Text>
                    </View>
                    <View style={styles.tagContainer}>
                      {context.keyTerms.map((term, index) => (
                        <View key={index} style={[styles.tag, styles.termTag]}>
                          <Text style={styles.tagText}>{term}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Background */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon name="info" size={20} color="#4A90E2" />
                    <Text style={styles.sectionTitle}>Background</Text>
                  </View>
                  <Text style={styles.sectionContent}>{context.background}</Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  panel: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2d2d2d',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d3d',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
  },
  highlightBox: {
    backgroundColor: '#2d2d2d',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  selectedText: {
    fontSize: 14,
    color: '#fff',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  termTag: {
    backgroundColor: '#27AE60',
  },
  tagText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#ccc',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#E74C3C',
    textAlign: 'center',
  },
});
