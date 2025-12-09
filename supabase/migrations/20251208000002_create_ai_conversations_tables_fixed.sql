-- Drop existing objects if they exist (for clean re-run)
DROP TRIGGER IF EXISTS update_conversation_timestamp_on_message ON public.ai_messages;
DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON public.ai_conversations;
DROP FUNCTION IF EXISTS update_conversation_on_message();
DROP FUNCTION IF EXISTS update_ai_conversation_updated_at();

-- Drop existing policies
DROP POLICY IF EXISTS "Users can delete references from their conversations" ON public.conversation_references;
DROP POLICY IF EXISTS "Users can insert references to their conversations" ON public.conversation_references;
DROP POLICY IF EXISTS "Users can view references from their conversations" ON public.conversation_references;
DROP POLICY IF EXISTS "Users can delete messages from their conversations" ON public.ai_messages;
DROP POLICY IF EXISTS "Users can insert messages to their conversations" ON public.ai_messages;
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.ai_messages;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.ai_conversations;

-- Drop existing tables (cascade will drop dependent objects)
DROP TABLE IF EXISTS public.conversation_references CASCADE;
DROP TABLE IF EXISTS public.ai_messages CASCADE;
DROP TABLE IF EXISTS public.ai_conversations CASCADE;

-- Create ai_conversations table
CREATE TABLE public.ai_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Nueva conversación',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_archived BOOLEAN DEFAULT false NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create ai_messages table
CREATE TABLE public.ai_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool', 'function')),
    content TEXT,
    tool_calls JSONB,
    tool_call_id TEXT,
    name TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_hidden BOOLEAN DEFAULT false NOT NULL
);

-- Create conversation_references table for linking conversations to transactions/entities
CREATE TABLE public.conversation_references (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.ai_messages(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('transaction', 'budget', 'category', 'account', 'debt', 'wishlist')),
    entity_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_updated_at ON public.ai_conversations(updated_at DESC);
CREATE INDEX idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created_at ON public.ai_messages(created_at);
CREATE INDEX idx_conversation_references_conversation ON public.conversation_references(conversation_id);
CREATE INDEX idx_conversation_references_entity ON public.conversation_references(entity_type, entity_id);

-- Enable Row Level Security
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_references ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_conversations
CREATE POLICY "Users can view their own conversations"
    ON public.ai_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
    ON public.ai_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
    ON public.ai_conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
    ON public.ai_conversations FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for ai_messages
CREATE POLICY "Users can view messages from their conversations"
    ON public.ai_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE ai_conversations.id = ai_messages.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to their conversations"
    ON public.ai_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE ai_conversations.id = ai_messages.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages from their conversations"
    ON public.ai_messages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE ai_conversations.id = ai_messages.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

-- RLS Policies for conversation_references
CREATE POLICY "Users can view references from their conversations"
    ON public.conversation_references FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE ai_conversations.id = conversation_references.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert references to their conversations"
    ON public.conversation_references FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE ai_conversations.id = conversation_references.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete references from their conversations"
    ON public.conversation_references FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE ai_conversations.id = conversation_references.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

-- Function to automatically update updated_at timestamp
CREATE FUNCTION update_ai_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on ai_conversations
CREATE TRIGGER update_ai_conversations_updated_at
    BEFORE UPDATE ON public.ai_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_conversation_updated_at();

-- Function to update conversation's updated_at when a message is added
CREATE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.ai_conversations
    SET updated_at = timezone('utc'::text, now())
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp on message insert
CREATE TRIGGER update_conversation_timestamp_on_message
    AFTER INSERT ON public.ai_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();
