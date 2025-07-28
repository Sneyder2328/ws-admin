"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageSquare, Search, Clock, Phone, Loader2 } from 'lucide-react';
import { Conversation } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

export default function ConversationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchConversations();
    } else {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    // Filter conversations based on search term
    if (searchTerm.trim()) {
      const filtered = conversations.filter(conv => 
        conv.customerPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.customerName && conv.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchTerm, conversations]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`/api/projects/${projectId}/conversations`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getCustomerInitials = (phone: string, name?: string) => {
    if (name) {
      return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    }
    return phone.slice(-2);
  };

  const handleConversationClick = (conversationId: string) => {
    router.push(`/admin/conversations/${conversationId}?projectId=${projectId}`);
  };

  if (!projectId) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4 animate-fade-in">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">No Project Selected</h2>
              <p className="text-muted-foreground max-w-md">
                Select a project to view its conversations.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Conversations</h1>
        <p className="text-muted-foreground">
          Manage your WhatsApp conversations with customers
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by phone number, name, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 transition-apple"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <div className="text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-4 inline-block">
            {error}
          </div>
        </div>
      )}

      {/* Conversations List */}
      {!error && (
        <div className="space-y-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search terms to find what you\'re looking for.'
                  : 'Once you configure your WhatsApp Business API and start receiving messages, they will appear here.'
                }
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <Card 
                key={conversation.id}
                className="cursor-pointer transition-apple hover:bg-accent/50 border-border/40"
                onClick={() => handleConversationClick(conversation.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" alt="" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getCustomerInitials(conversation.customerPhone, conversation.customerName)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium truncate">
                            {conversation.customerName || conversation.customerPhone}
                          </h3>
                          {conversation.customerName && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 mr-1" />
                              {conversation.customerPhone}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(conversation.lastMessageTimestamp.toString())}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2 px-2 py-1 text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Load More Button (if needed for pagination) */}
      {filteredConversations.length > 0 && (
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}