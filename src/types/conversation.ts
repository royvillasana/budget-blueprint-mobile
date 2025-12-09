export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
  metadata?: Record<string, any>;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: 'system' | 'user' | 'assistant' | 'tool' | 'function';
  content: string | null | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
  attachments?: Array<{ url: string; type: 'image' | 'file' }>;
  metadata?: Record<string, any>;
  created_at: string;
  is_hidden: boolean;
}

export interface ConversationReference {
  id: string;
  conversation_id: string;
  message_id?: string;
  entity_type: 'transaction' | 'budget' | 'category' | 'account' | 'debt' | 'wishlist';
  entity_id: string;
  created_at: string;
}

export interface ConversationWithMessageCount extends Conversation {
  message_count?: number;
  last_message?: string;
}

export interface CreateConversationParams {
  title?: string;
  metadata?: Record<string, any>;
}

export interface UpdateConversationParams {
  title?: string;
  archived?: boolean;
  metadata?: Record<string, any>;
}

export interface CreateMessageParams {
  conversation_id: string;
  role: ConversationMessage['role'];
  content: ConversationMessage['content'];
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
  attachments?: Array<{ url: string; type: 'image' | 'file' }>;
  metadata?: Record<string, any>;
  is_hidden?: boolean;
}

export interface ConversationFilters {
  include_archived?: boolean;
  search_query?: string;
  limit?: number;
  offset?: number;
}
