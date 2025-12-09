import { supabase } from '@/integrations/supabase/client';
import {
  Conversation,
  ConversationMessage,
  ConversationReference,
  ConversationWithMessageCount,
  CreateConversationParams,
  UpdateConversationParams,
  CreateMessageParams,
  ConversationFilters
} from '@/types/conversation';

export class ConversationService {
  // ==================== CONVERSATION CRUD ====================

  /**
   * Create a new conversation
   */
  static async createConversation(
    userId: string,
    params: CreateConversationParams = {}
  ): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: userId,
          title: params.title || 'Nueva conversación',
          metadata: params.metadata || {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }

  /**
   * Get a conversation by ID
   */
  static async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) {
        console.error('Error fetching conversation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
  }

  /**
   * List conversations with optional filters
   */
  static async listConversations(
    userId: string,
    filters: ConversationFilters = {}
  ): Promise<ConversationWithMessageCount[]> {
    try {
      let query = supabase
        .from('ai_conversations')
        .select(`
          *,
          ai_messages!ai_messages_conversation_id_fkey(count)
        `)
        .eq('user_id', userId);

      // Apply filters
      if (!filters.include_archived) {
        query = query.eq('archived', false);
      }

      if (filters.search_query) {
        query = query.ilike('title', `%${filters.search_query}%`);
      }

      // Order by updated_at descending
      query = query.order('updated_at', { ascending: false });

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error listing conversations:', error);
        return [];
      }

      // Transform data to include message count
      return (data || []).map((conv: any) => ({
        ...conv,
        message_count: conv.ai_messages?.[0]?.count || 0
      }));
    } catch (error) {
      console.error('Error listing conversations:', error);
      return [];
    }
  }

  /**
   * Update a conversation
   */
  static async updateConversation(
    conversationId: string,
    params: UpdateConversationParams
  ): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .update(params)
        .eq('id', conversationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating conversation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating conversation:', error);
      return null;
    }
  }

  /**
   * Delete a conversation (cascades to messages and references)
   */
  static async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) {
        console.error('Error deleting conversation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  /**
   * Archive/unarchive a conversation
   */
  static async archiveConversation(
    conversationId: string,
    archived: boolean
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .update({ archived: archived })
        .eq('id', conversationId);

      if (error) {
        console.error('Error archiving conversation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error archiving conversation:', error);
      return false;
    }
  }

  // ==================== MESSAGE CRUD ====================

  /**
   * Add a message to a conversation
   */
  static async addMessage(params: CreateMessageParams): Promise<ConversationMessage | null> {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: params.conversation_id,
          role: params.role,
          content: params.content,
          tool_calls: params.tool_calls,
          tool_call_id: params.tool_call_id,
          name: params.name,
          attachments: params.attachments || [],
          metadata: params.metadata || {},
          is_hidden: params.is_hidden || false
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding message:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  }

  /**
   * Get all messages for a conversation
   */
  static async getMessages(
    conversationId: string,
    limit?: number,
    offset?: number
  ): Promise<ConversationMessage[]> {
    try {
      let query = supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Delete a message
   */
  static async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('Error deleting message:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  // ==================== REFERENCES ====================

  /**
   * Add a reference linking a conversation to an entity
   */
  static async addReference(
    conversationId: string,
    entityType: ConversationReference['entity_type'],
    entityId: string,
    messageId?: string
  ): Promise<ConversationReference | null> {
    try {
      const { data, error } = await supabase
        .from('conversation_references')
        .insert({
          conversation_id: conversationId,
          message_id: messageId,
          entity_type: entityType,
          entity_id: entityId
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding reference:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error adding reference:', error);
      return null;
    }
  }

  /**
   * Get all references for a conversation
   */
  static async getReferences(conversationId: string): Promise<ConversationReference[]> {
    try {
      const { data, error } = await supabase
        .from('conversation_references')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching references:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching references:', error);
      return [];
    }
  }

  /**
   * Find conversations that reference a specific entity
   */
  static async findConversationsByEntity(
    entityType: ConversationReference['entity_type'],
    entityId: string
  ): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversation_references')
        .select('ai_conversations(*)')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      if (error) {
        console.error('Error finding conversations by entity:', error);
        return [];
      }

      return (data || []).map((ref: any) => ref.ai_conversations);
    } catch (error) {
      console.error('Error finding conversations by entity:', error);
      return [];
    }
  }

  // ==================== EXPORT/IMPORT ====================

  /**
   * Export a conversation with all its messages to JSON
   */
  static async exportConversation(conversationId: string): Promise<any | null> {
    try {
      const conversation = await this.getConversation(conversationId);
      if (!conversation) return null;

      const messages = await this.getMessages(conversationId);
      const references = await this.getReferences(conversationId);

      return {
        version: '1.0',
        conversation,
        messages,
        references,
        exported_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting conversation:', error);
      return null;
    }
  }

  /**
   * Import a conversation from exported JSON
   */
  static async importConversation(
    userId: string,
    exportedData: any
  ): Promise<Conversation | null> {
    try {
      // Validate export format
      if (!exportedData.version || !exportedData.conversation || !exportedData.messages) {
        console.error('Invalid export format');
        return null;
      }

      // Create new conversation
      const newConversation = await this.createConversation(userId, {
        title: exportedData.conversation.title,
        metadata: {
          ...exportedData.conversation.metadata,
          imported_from: exportedData.conversation.id,
          imported_at: new Date().toISOString()
        }
      });

      if (!newConversation) return null;

      // Import messages
      for (const message of exportedData.messages) {
        await this.addMessage({
          conversation_id: newConversation.id,
          role: message.role,
          content: message.content,
          tool_calls: message.tool_calls,
          tool_call_id: message.tool_call_id,
          name: message.name,
          attachments: message.attachments,
          metadata: message.metadata,
          is_hidden: message.is_hidden
        });
      }

      // Import references if present
      if (exportedData.references) {
        for (const ref of exportedData.references) {
          await this.addReference(
            newConversation.id,
            ref.entity_type,
            ref.entity_id
          );
        }
      }

      return newConversation;
    } catch (error) {
      console.error('Error importing conversation:', error);
      return null;
    }
  }

  // ==================== UTILITIES ====================

  /**
   * Get the last message in a conversation
   */
  static async getLastMessage(conversationId: string): Promise<ConversationMessage | null> {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Count messages in a conversation
   */
  static async countMessages(conversationId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('ai_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId);

      if (error) {
        console.error('Error counting messages:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error counting messages:', error);
      return 0;
    }
  }

  /**
   * Generate a smart title for a conversation based on first messages
   */
  static async generateTitle(conversationId: string): Promise<string> {
    try {
      const messages = await this.getMessages(conversationId, 3);

      // Find first user message
      const firstUserMessage = messages.find(m => m.role === 'user');

      if (firstUserMessage && typeof firstUserMessage.content === 'string') {
        // Take first 50 characters
        const title = firstUserMessage.content.slice(0, 50);
        return title.length < firstUserMessage.content.length ? `${title}...` : title;
      }

      return 'Nueva conversación';
    } catch (error) {
      console.error('Error generating title:', error);
      return 'Nueva conversación';
    }
  }
}
