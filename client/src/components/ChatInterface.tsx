import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send, Bot, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Message } from "@shared/schema";

interface ChatInterfaceProps {
  title: string;
  chatType: "bot" | "team";
  entityId: string; // botId or teamId
  conversationId?: string;
  onConversationCreated?: (conversationId: string) => void;
}

export function ChatInterface({ 
  title, 
  chatType, 
  entityId,
  conversationId: initialConversationId,
  onConversationCreated 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load existing conversation history if conversationId is provided
  const { data: existingMessages } = useQuery<Message[]>({
    queryKey: [`/api/conversations/${conversationId}/messages`],
    enabled: !!conversationId,
  });

  // Track the last loaded conversation ID to prevent unnecessary updates
  const [lastLoadedConvId, setLastLoadedConvId] = useState<string | undefined>(initialConversationId);

  // Clear messages and reset conversation ID when entity changes (switching between bots/teams)
  useEffect(() => {
    setMessages([]);
    setInput("");
    setConversationId(undefined);
    setLastLoadedConvId(undefined);
  }, [entityId]);

  // Sync local conversationId with prop changes (including undefined for entities with no history)
  useEffect(() => {
    setConversationId(initialConversationId);
  }, [initialConversationId, entityId]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const endpoint = chatType === "bot" 
        ? `/api/bots/${entityId}/chat`
        : `/api/teams/${entityId}/chat`;
      
      const response = await apiRequest("POST", endpoint, {
        message,
        conversationId,
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      // Update messages - use data.messages if available
      if (data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
      
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
        setLastLoadedConvId(data.conversationId);
        onConversationCreated?.(data.conversationId);
        // Invalidate conversations query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      }
      
      // Don't refetch messages - we already have the latest from the response
      // This prevents race conditions where the refetch overwrites our state
      
      setInput("");
    },
    onError: (error: any) => {
      // Extract clean error message
      const errorMessage = error?.message || "Failed to send message";
      const cleanError = errorMessage.replace(/^Error:\s*/i, '').replace(/^\d+:\s*/, '');
      
      // Add error message to chat without disrupting existing messages
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          conversationId: conversationId || "",
          role: "assistant",
          content: `Error: ${cleanError}`,
          botId: null,
          createdAt: new Date(),
        } as any,
      ]);
    },
  });

  // Update messages only when conversation ID changes (not on every query refetch)
  useEffect(() => {
    if (conversationId !== lastLoadedConvId && existingMessages !== undefined) {
      setMessages(existingMessages);
      setLastLoadedConvId(conversationId);
    }
  }, [conversationId, existingMessages, lastLoadedConvId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {!messages || messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Start a conversation...</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                  data-testid={`message-${message.role}-${index}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[90%] sm:max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>

                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            
            {sendMessageMutation.isPending && (
              <div className="flex gap-3 justify-start" data-testid="message-loading">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                </div>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 sm:p-4 border-t">
          <div className="flex flex-col sm:flex-row gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={chatType === "team" ? "Ask the team..." : "Type your message..."}
              className="min-h-[60px] resize-none flex-1"
              disabled={sendMessageMutation.isPending}
              data-testid="textarea-chat-input"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || sendMessageMutation.isPending}
              size="icon"
              className="h-[60px] w-full sm:w-[60px] flex-shrink-0"
              data-testid="button-send-message"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
