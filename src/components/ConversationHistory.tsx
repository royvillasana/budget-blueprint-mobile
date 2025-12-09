import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useConversations } from '@/contexts/ConversationContext';
import {
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  ArchiveRestore,
  Download,
  Upload,
  MessageSquare,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ConversationHistoryProps {
  onClose?: () => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({ onClose }) => {
  const {
    conversations,
    currentConversation,
    switchConversation,
    updateConversation,
    deleteConversation,
    archiveConversation,
    exportConversation,
    importConversation,
    refreshConversations,
  } = useConversations();

  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  // Refresh conversations on mount
  useEffect(() => {
    refreshConversations({ include_archived: showArchived });
  }, [showArchived, refreshConversations]);

  // Filter conversations based on search query and archive status
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArchiveFilter = showArchived ? true : !conv.archived;
    return matchesSearch && matchesArchiveFilter;
  });

  /**
   * Handle switching to a conversation
   */
  const handleSwitchConversation = async (conversationId: string) => {
    await switchConversation(conversationId);
    if (onClose) onClose();
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

  /**
   * Handle archiving/unarchiving a conversation
   */
  const handleToggleArchive = async (conversationId: string, isArchived: boolean) => {
    await archiveConversation(conversationId, !isArchived);

    toast({
      title: isArchived ? 'Conversación restaurada' : 'Conversación archivada',
      description: isArchived
        ? 'La conversación ha sido restaurada'
        : 'La conversación ha sido archivada'
    });
  };

  /**
   * Handle exporting a conversation
   */
  const handleExportConversation = async (conversationId: string) => {
    const exportedData = await exportConversation(conversationId);

    if (exportedData) {
      const blob = new Blob([JSON.stringify(exportedData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${conversationId}-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Conversación exportada',
        description: 'La conversación ha sido descargada como archivo JSON'
      });
    }
  };

  /**
   * Handle importing a conversation
   */
  const handleImportConversation = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const imported = await importConversation(data);

      if (imported) {
        toast({
          title: 'Conversación importada',
          description: 'La conversación ha sido importada exitosamente'
        });
      } else {
        toast({
          title: 'Error al importar',
          description: 'No se pudo importar la conversación. Verifica el formato del archivo.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error importing conversation:', error);
      toast({
        title: 'Error al importar',
        description: 'El archivo no tiene un formato válido',
        variant: 'destructive'
      });
    }

    // Reset input
    event.target.value = '';
  };

  /**
   * Format relative time
   */
  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Historial de Conversaciones</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showArchived ? 'Activas' : 'Archivadas'}
              </Button>
              <label htmlFor="import-conversation">
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </span>
                </Button>
              </label>
              <input
                id="import-conversation"
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportConversation}
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay conversaciones</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group relative rounded-lg border p-3 cursor-pointer transition-colors ${
                      currentConversation?.id === conv.id
                        ? 'bg-accent border-primary'
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={() => handleSwitchConversation(conv.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{conv.title}</h3>
                          {conv.archived && (
                            <Badge variant="secondary" className="text-xs">
                              Archivada
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{conv.message_count || 0} mensajes</span>
                          <span>•</span>
                          <span>{formatRelativeTime(conv.updated_at)}</span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenRenameDialog(conv.id, conv.title);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Renombrar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportConversation(conv.id);
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleArchive(conv.id, conv.archived);
                            }}
                          >
                            {conv.archived ? (
                              <>
                                <ArchiveRestore className="h-4 w-4 mr-2" />
                                Restaurar
                              </>
                            ) : (
                              <>
                                <Archive className="h-4 w-4 mr-2" />
                                Archivar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDeleteDialog(conv.id);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
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
