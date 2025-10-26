import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Bot, Plus, Trash2, MessageSquare, Sparkles, AlertTriangle, Settings, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Bot as BotType } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChatInterface } from "@/components/ChatInterface";

export default function BotsManagement() {
  const { toast } = useToast();
  const [chatBotId, setChatBotId] = useState<string | null>(null);
  const [chatBotName, setChatBotName] = useState<string>("");
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);

  const { data: bots = [], isLoading } = useQuery<Array<BotType & { modelValid?: boolean }>>({
    queryKey: ["/api/bots"],
  });

  const { data: botConversations = [] } = useQuery<Array<{ id: string; botId: string; createdAt: string }>>({
    queryKey: [`/api/conversations?botId=${chatBotId}`],
    enabled: !!chatBotId,
  });

  useEffect(() => {
    if (botConversations.length > 0) {
      setActiveConversationId(botConversations[0].id);
    } else {
      setActiveConversationId(undefined);
    }
  }, [botConversations]);

  const deleteBotMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/bots/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      toast({
        title: "Success",
        description: "Bot deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading your AI bots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Bot Library</h1>
                  <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">Configure and manage your AI assistant collection</p>
                </div>
              </div>
            </div>
            <Link href="/bots/create" className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 shadow-sm w-full sm:w-auto" data-testid="button-create-new-bot">
                <Plus className="h-5 w-5" />
                Create New Bot
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-muted-foreground">Total Bots:</span>
              <span className="font-semibold">{bots.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-muted-foreground">Active:</span>
              <span className="font-semibold">{bots.filter(b => b.modelValid !== false).length}</span>
            </div>
            {bots.some(b => b.modelValid === false) && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-destructive"></div>
                <span className="text-muted-foreground">Needs Attention:</span>
                <span className="font-semibold">{bots.filter(b => b.modelValid === false).length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {bots.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Bot className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No AI bots yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Create your first AI bot to get started. Configure it with specific models, 
                system prompts, and parameters tailored to your needs.
              </p>
              <Link href="/bots/create">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Your First Bot
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <Card 
                key={bot.id} 
                className="hover-elevate border-border/50 overflow-hidden group" 
                data-testid={`card-bot-${bot.id}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Bot className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <div className="flex gap-1">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            data-testid={`button-delete-bot-${bot.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete AI Bot</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "<strong>{bot.name}</strong>"? 
                              This will remove all associated conversations and cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteBotMutation.mutate(bot.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Bot
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <CardTitle className="text-xl mb-2">{bot.name}</CardTitle>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {bot.role && (
                      <Badge variant="secondary" className="text-xs">
                        {bot.role}
                      </Badge>
                    )}
                    {bot.modelValid === false && (
                      <Badge variant="destructive" className="text-xs gap-1" data-testid={`badge-invalid-${bot.id}`}>
                        <AlertTriangle className="h-3 w-3" />
                        Unavailable
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Model Warning */}
                  {bot.modelValid === false && (
                    <div 
                      className="p-3 rounded-lg bg-destructive/5 border border-destructive/20" 
                      data-testid={`alert-invalid-${bot.id}`}
                    >
                      <div className="flex gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <p className="font-semibold text-destructive">Model No Longer Available</p>
                          <p className="text-muted-foreground">
                            This model is not accessible. Please create a new bot with an active model.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Description */}
                  {bot.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {bot.description}
                    </p>
                  )}
                  
                  {/* Model Badge */}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <Sparkles className="h-4 w-4 text-accent flex-shrink-0" />
                    <span className="text-sm font-medium truncate font-mono">
                      {bot.model.split("/")[1]?.replace(":free", "") || bot.model}
                    </span>
                  </div>

                  {/* Parameters */}
                  <div className="pt-3 border-t border-border/50 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Zap className="h-3 w-3" />
                        Temperature
                      </span>
                      <span className="font-mono font-medium">{bot.temperature}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Settings className="h-3 w-3" />
                        Max Tokens
                      </span>
                      <span className="font-mono font-medium">{bot.maxTokens}</span>
                    </div>
                  </div>

                  {/* Chat Button */}
                  <Button
                    className="w-full gap-2"
                    variant={bot.modelValid === false ? "outline" : "default"}
                    onClick={() => {
                      setChatBotId(bot.id);
                      setChatBotName(bot.name);
                    }}
                    disabled={bot.modelValid === false}
                    data-testid={`button-chat-bot-${bot.id}`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    {bot.modelValid === false ? "Unavailable" : "Start Conversation"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Chat Dialog */}
      <Dialog open={chatBotId !== null} onOpenChange={(open) => !open && setChatBotId(null)}>
        <DialogContent className="max-w-4xl h-[80vh] sm:h-[700px] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Chat with {chatBotName}</DialogTitle>
                <p className="text-sm text-muted-foreground">AI-powered conversation</p>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-6 pb-6">
            {chatBotId && (
              <ChatInterface
                title={chatBotName}
                chatType="bot"
                entityId={chatBotId}
                conversationId={activeConversationId}
                onConversationCreated={setActiveConversationId}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
