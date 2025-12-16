import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConversations } from '@/contexts/ConversationContext';
import { Plus, MoreVertical, Edit, Trash2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ConversationTabs: React.FC = () => {
  const {
    currentConversation,
    conversations,
    createConversation,
    switchConversation,
    updateConversation,
    deleteConversation,
  } = useConversations();

  const { toast } = useToast();

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  // Filter to only show non-archived conversations
  const activeConversations = conversations.filter(c => !c.is_archived);

  /**
   * Handle creating a new conversation
   */
  const handleCreateConversation = async () => {
    const newConv = await createConversation();

    if (newConv) {
      toast({
        title: 'Conversación creada',
        description: `Se ha creado "${newConv.title}"`
      });
    }
  };

  /**
   * Handle switching to a different conversation
   */
  const handleSwitchConversation = async (conversationId: string) => {
    if (conversationId === currentConversation?.id) return;
    if (conversationId === 'new') {
      await handleCreateConversation();
      return;
    }
    await switchConversation(conversationId);
  };

  /**
   * Open rename dialog
   */
  const handleOpenRenameDialog = (conversationId: string, currentTitle: string) => {
    setSelectedConversationId(conversationId);
    setNewTitle(currentTitle);
    setIsRenameDialogOpen(true);
  };

  /**
   * Handle renaming a conversation
   */
  const handleRenameConversation = async () => {
    if (!selectedConversationId || !newTitle.trim()) return;

    await updateConversation(selectedConversationId, { title: newTitle.trim() });

    toast({
      title: 'Conversación renombrada',
      description: 'El nombre de la conversación ha sido actualizado'
    });

    setIsRenameDialogOpen(false);
    setSelectedConversationId(null);
    setNewTitle('');
  };

  /**
   * Open delete confirmation dialog
   */
  const handleOpenDeleteDialog = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Handle deleting a conversation
   */
  const handleDeleteConversation = async () => {
    if (!selectedConversationId) return;

    await deleteConversation(selectedConversationId);

    toast({
      title: 'Conversación eliminada',
      description: 'La conversación ha sido eliminada permanentemente',
      variant: 'destructive'
    });

    setIsDeleteDialogOpen(false);
    setSelectedConversationId(null);
  };

  // Truncate long titles for dropdown
  const truncateTitle = (title: string, maxLength: number = 35) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
  };

  return (
    <>
      <div className="flex items-center gap-2 border-b border-border p-2">
        <div className="flex-1 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Select
            value={currentConversation?.id || ''}
            onValueChange={handleSwitchConversation}
          >
            <SelectTrigger className="flex-1 h-9">
              <SelectValue placeholder="Selecciona una conversación">
                {currentConversation?.title || 'Selecciona una conversación'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {activeConversations.length > 0 ? (
                activeConversations.map((conv) => (
                  <SelectItem key={conv.id} value={conv.id}>
                    {truncateTitle(conv.title)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="empty" disabled>
                  No hay conversaciones
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 flex-shrink-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCreateConversation}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva conversación
              </DropdownMenuItem>
              {currentConversation && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleOpenRenameDialog(currentConversation.id, currentConversation.title)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Renombrar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleOpenDeleteDialog(currentConversation.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renombrar conversación</DialogTitle>
            <DialogDescription>
              Ingresa un nuevo nombre para esta conversación
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="conversation-title">Título</Label>
              <Input
                id="conversation-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Nombre de la conversación"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameConversation();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRenameConversation} disabled={!newTitle.trim()}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar conversación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta conversación? Esta acción no se puede deshacer y se eliminarán todos los mensajes asociados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConversation}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
