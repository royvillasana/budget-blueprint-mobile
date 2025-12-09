import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ConversationService } from '@/services/ConversationService';
import {
  Conversation,
  ConversationMessage,
  ConversationWithMessageCount,
  CreateConversationParams,
  UpdateConversationParams,
  CreateMessageParams,
  ConversationFilters
} from '@/types/conversation';
import { supabase } from '@/integrations/supabase/client';

interface ConversationContextType {
  // Current conversation state
  currentConversation: Conversation | null;
  currentMessages: ConversationMessage[];

  // All conversations list
  conversations: ConversationWithMessageCount[];

  // Loading states
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;

  // Conversation management
  createConversation: (params?: CreateConversationParams) => Promise<Conversation | null>;
  switchConversation: (conversationId: string) => Promise<void>;
  updateConversation: (conversationId: string, params: UpdateConversationParams) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  archiveConversation: (conversationId: string, archived: boolean) => Promise<void>;

  // Message management
  addMessage: (params: CreateMessageParams) => Promise<ConversationMessage | null>;
  refreshMessages: () => Promise<void>;

  // Conversation list management
  refreshConversations: (filters?: ConversationFilters) => Promise<void>;

  // Export/Import
  exportConversation: (conversationId: string) => Promise<any>;
  importConversation: (exportedData: any) => Promise<Conversation | null>;

  // Utilities
  generateTitle: (conversationId: string) => Promise<string>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const useConversations = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversations must be used within ConversationProvider');
  }
  return context;
};

interface ConversationProviderProps {
  children: React.ReactNode;
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({ children }) => {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [currentMessages, setCurrentMessages] = useState<ConversationMessage[]>([]);
  const [conversations, setConversations] = useState<ConversationWithMessageCount[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // Load conversations when user is available
  useEffect(() => {
    if (userId) {
      refreshConversations();
    }
  }, [userId]);

  /**
   * Refresh the list of conversations
   */
  const refreshConversations = useCallback(async (filters?: ConversationFilters) => {
    if (!userId) return;

    setIsLoadingConversations(true);
    try {
      const convs = await ConversationService.listConversations(userId, filters);
      setConversations(convs);
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [userId]);

  /**
   * Refresh messages for the current conversation
   */
  const refreshMessages = useCallback(async () => {
    if (!currentConversation) return;

    setIsLoadingMessages(true);
    try {
      const messages = await ConversationService.getMessages(currentConversation.id);
      setCurrentMessages(messages);
    } catch (error) {
      console.error('Error refreshing messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [currentConversation]);

  /**
   * Create a new conversation
   */
  const createConversation = useCallback(async (params?: CreateConversationParams) => {
    if (!userId) return null;

    try {
      const newConv = await ConversationService.createConversation(userId, params);
      if (newConv) {
        // Refresh conversations list
        await refreshConversations();

        // Switch to the new conversation
        setCurrentConversation(newConv);
        setCurrentMessages([]);
      }
      return newConv;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }, [userId, refreshConversations]);

  /**
   * Switch to a different conversation
   */
  const switchConversation = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const conv = await ConversationService.getConversation(conversationId);
      if (conv) {
        setCurrentConversation(conv);
        const messages = await ConversationService.getMessages(conversationId);
        setCurrentMessages(messages);
      }
    } catch (error) {
      console.error('Error switching conversation:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  /**
   * Update a conversation
   */
  const updateConversation = useCallback(async (
    conversationId: string,
    params: UpdateConversationParams
  ) => {
    try {
      const updated = await ConversationService.updateConversation(conversationId, params);
      if (updated) {
        // Update current conversation if it's the one being updated
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(updated);
        }

        // Refresh conversations list
        await refreshConversations();
      }
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  }, [currentConversation, refreshConversations]);

  /**
   * Delete a conversation
   */
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const success = await ConversationService.deleteConversation(conversationId);
      if (success) {
        // If deleting current conversation, clear it
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null);
          setCurrentMessages([]);
        }

        // Refresh conversations list
        await refreshConversations();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [currentConversation, refreshConversations]);

  /**
   * Archive/unarchive a conversation
   */
  const archiveConversation = useCallback(async (
    conversationId: string,
    archived: boolean
  ) => {
    try {
      const success = await ConversationService.archiveConversation(conversationId, archived);
      if (success) {
        // Refresh conversations list
        await refreshConversations();
      }
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  }, [refreshConversations]);

  /**
   * Add a message to the current conversation
   */
  const addMessage = useCallback(async (params: CreateMessageParams) => {
    try {
      const newMessage = await ConversationService.addMessage(params);
      if (newMessage && currentConversation?.id === params.conversation_id) {
        // Optimistically add message to current messages
        setCurrentMessages(prev => [...prev, newMessage]);
      }
      return newMessage;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  }, [currentConversation]);

  /**
   * Export a conversation
   */
  const exportConversation = useCallback(async (conversationId: string) => {
    try {
      return await ConversationService.exportConversation(conversationId);
    } catch (error) {
      console.error('Error exporting conversation:', error);
      return null;
    }
  }, []);

  /**
   * Import a conversation
   */
  const importConversation = useCallback(async (exportedData: any) => {
    if (!userId) return null;

    try {
      const imported = await ConversationService.importConversation(userId, exportedData);
      if (imported) {
        // Refresh conversations list
        await refreshConversations();
      }
      return imported;
    } catch (error) {
      console.error('Error importing conversation:', error);
      return null;
    }
  }, [userId, refreshConversations]);

  /**
   * Generate a smart title for a conversation
   */
  const generateTitle = useCallback(async (conversationId: string) => {
    try {
      return await ConversationService.generateTitle(conversationId);
    } catch (error) {
      console.error('Error generating title:', error);
      return 'Nueva conversación';
    }
  }, []);

  const value: ConversationContextType = {
    currentConversation,
    currentMessages,
    conversations,
    isLoadingConversations,
    isLoadingMessages,
    createConversation,
    switchConversation,
    updateConversation,
    deleteConversation,
    archiveConversation,
    addMessage,
    refreshMessages,
    refreshConversations,
    exportConversation,
    importConversation,
    generateTitle
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};
