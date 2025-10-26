import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Users, Bot, Loader2, AlertCircle, Save, MessageSquare, ListChecks, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OutputMultiView } from "@/components/OutputMultiView";
import { ChatInterface } from "@/components/ChatInterface";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Team, Bot as BotType } from "@shared/schema";

interface BotResponse {
  botId: string;
  botName: string;
  task: string;
  output: string;
  status: "success" | "error";
  error?: string;
}

export default function TeamWorkspace() {
  const [, params] = useRoute("/teams/:id");
  const [, setLocation] = useLocation();
  const teamId = params?.id;
  const { toast } = useToast();
  
  const [brief, setBrief] = useState("");
  const [delegations, setDelegations] = useState<Record<string, string>>({});
  const [responses, setResponses] = useState<BotResponse[]>([]);
  const [combinedOutput, setCombinedOutput] = useState("");
  const [hasExecuted, setHasExecuted] = useState(false);
  const [outputTitle, setOutputTitle] = useState("");
  const [teamConversationId, setTeamConversationId] = useState<string | undefined>(undefined);

  const { data: team, isLoading: teamLoading } = useQuery<Team>({
    queryKey: [`/api/teams/${teamId}`],
    enabled: !!teamId,
  });

  const { data: teamBots = [], isLoading: botsLoading } = useQuery<BotType[]>({
    queryKey: [`/api/teams/${teamId}/bots`],
    enabled: !!teamId,
  });

  // Fetch latest conversation for the team
  const { data: teamConversations = [] } = useQuery<Array<{ id: string; teamId: string; createdAt: string }>>({
    queryKey: [`/api/conversations?teamId=${teamId}`],
    enabled: !!teamId,
  });

  // Set the latest conversation ID when team is loaded
  useEffect(() => {
    if (teamConversations.length > 0) {
      setTeamConversationId(teamConversations[0].id);
    } else {
      setTeamConversationId(undefined);
    }
  }, [teamConversations]);

  const saveOutputMutation = useMutation({
    mutationFn: async (data: { title: string; brief: string; delegations: any; responses: BotResponse[]; combinedOutput: string }) => {
      const response = await apiRequest("POST", "/api/outputs", {
        teamId: teamId,
        title: data.title,
        brief: data.brief,
        delegations: data.delegations,
        responses: data.responses,
        combinedOutput: data.combinedOutput,
      });
      if (!response.ok) {
        throw new Error("Failed to save output");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outputs"] });
      toast({
        title: "Saved",
        description: "Output saved successfully! View it in the Outputs page.",
      });
      setOutputTitle("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save output",
        variant: "destructive",
      });
    },
  });

  const executeMutation = useMutation({
    mutationFn: async (data: { teamId: string; brief: string; delegations: Array<{ botId: string; task: string }> }) => {
      const response = await apiRequest("POST", "/api/openrouter/execute", data);
      const result = await response.json();
      return result as { responses: BotResponse[] };
    },
    onSuccess: (data: { responses: BotResponse[] }) => {
      if (!data || !Array.isArray(data.responses)) {
        toast({
          title: "Error",
          description: "Invalid response format from server",
          variant: "destructive",
        });
        return;
      }

      setResponses(data.responses);
      
      // Generate combined output from successful responses
      const successfulResponses = data.responses.filter(r => r.status === "success");
      if (successfulResponses.length > 0) {
        const combined = successfulResponses.map((r, idx) => 
          `${idx + 1}. ${r.botName} (${r.task}):\n\n${r.output}`
        ).join("\n\n---\n\n");
        setCombinedOutput(combined);
      } else {
        // Clear combined output when all executions fail
        setCombinedOutput("");
        toast({
          title: "Warning",
          description: "All team members encountered errors. Please check the individual responses.",
          variant: "destructive",
        });
      }
      
      setHasExecuted(true);
      
      const errorCount = data.responses.filter(r => r.status === "error").length;
      toast({
        title: "Execution Complete",
        description: errorCount > 0 
          ? `${successfulResponses.length} succeeded, ${errorCount} failed`
          : `All ${data.responses.length} team members completed successfully`,
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

  const handleSaveOutput = () => {
    if (!outputTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the output",
        variant: "destructive",
      });
      return;
    }

    const delegationsList = teamBots.map(bot => ({
      botId: bot.id,
      task: delegations[bot.id] || `Work on: ${brief}`,
    }));

    saveOutputMutation.mutate({
      title: outputTitle,
      brief,
      delegations: delegationsList,
      responses,
      combinedOutput,
    });
  };

  const handleExecute = () => {
    if (!brief.trim()) {
      toast({
        title: "Error",
        description: "Please enter a brief",
        variant: "destructive",
      });
      return;
    }

    // Clear previous results before execution
    setCombinedOutput("");
    setResponses([]);
    setHasExecuted(false);

    const delegationsList = teamBots.map(bot => ({
      botId: bot.id,
      task: delegations[bot.id] || `Work on: ${brief}`,
    }));

    executeMutation.mutate({
      teamId: teamId!,
      brief,
      delegations: delegationsList,
    });
  };

  if (teamLoading || botsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading team workspace...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Team not found</h3>
              <p className="text-muted-foreground">The requested team does not exist</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (teamBots.length === 0) {
    return (
      <div className="h-full overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                <Bot className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No team members</h3>
              <p className="text-muted-foreground mb-6">
                This team doesn't have any bots yet. Add some bots to get started.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{team.name}</h1>
              <p className="text-muted-foreground">{team.description || "Collaborate with your AI team"}</p>
            </div>
          </div>
          <Button
            onClick={() => setLocation(`/teams/${teamId}/collaborate`)}
            variant="default"
            size="lg"
            className="gap-2"
            data-testid="button-collaborative-mode"
          >
            <Sparkles className="h-5 w-5" />
            Full Collaborative Mode
          </Button>
        </div>
        
        {/* Info Card about Collaborative Mode */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm mb-1">Try Full Collaborative Mode</p>
                <p className="text-xs text-muted-foreground">
                  Experience true team collaboration: Planning phase (bots ask questions), Execution phase (collaborative work), and Review phase (bots critique and suggest improvements). Click "Full Collaborative Mode" above.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="brief" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="brief" className="gap-2" data-testid="tab-brief-delegation">
              <ListChecks className="h-4 w-4" />
              Brief Delegation
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2" data-testid="tab-team-chat">
              <MessageSquare className="h-4 w-4" />
              Team Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="brief" className="mt-6">
            <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Collaborative Team Execution
                </CardTitle>
                <CardDescription>
                  Team members work sequentially, with each bot seeing and building upon previous teammates' outputs
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="secondary" data-testid="badge-member-count">
                  {teamBots.length} AI Bots
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Sequential Collaboration
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="brief">Project Brief</Label>
              <Textarea
                id="brief"
                placeholder="Enter your project brief... This sets the context for all team members."
                className="min-h-32 mt-2"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                data-testid="textarea-brief"
              />
            </div>

            <div className="space-y-4">
              <Label>Task Delegation (Optional - customize each bot's specific task)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamBots.map((bot) => (
                  <Card key={bot.id} className="bg-muted/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold">{bot.name}</h4>
                          {bot.role && (
                            <p className="text-xs text-muted-foreground">{bot.role}</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Input
                        placeholder={`Specific task for ${bot.name}... (leave empty to use brief)`}
                        value={delegations[bot.id] || ""}
                        onChange={(e) => setDelegations({ ...delegations, [bot.id]: e.target.value })}
                        data-testid={`input-task-${bot.id}`}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-foreground mb-1">How Collaborative Execution Works:</p>
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      <li>• Bot #{1} receives the brief and completes their task first</li>
                      <li>• Bot #{2} sees Bot #1's output and builds upon it</li>
                      <li>• Each subsequent bot sees all previous work, enabling true collaboration</li>
                      <li>• Final output represents the collective intelligence of the entire team</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleExecute}
                disabled={!brief.trim() || executeMutation.isPending}
                size="lg"
                className="w-full gap-2"
                data-testid="button-execute-team"
              >
                {executeMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Collaborating Sequentially...
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5" />
                    Start Collaborative Execution
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {hasExecuted && responses.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Save Output
                </CardTitle>
                <CardDescription>Save this execution result for later reference</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="output-title">Output Title</Label>
                  <Input
                    id="output-title"
                    placeholder="e.g., Product Description v1, Marketing Campaign Ideas"
                    value={outputTitle}
                    onChange={(e) => setOutputTitle(e.target.value)}
                    data-testid="input-output-title"
                    className="mt-2"
                  />
                </div>
                <Button
                  onClick={handleSaveOutput}
                  disabled={!outputTitle.trim() || saveOutputMutation.isPending}
                  className="gap-2"
                  data-testid="button-save-output"
                >
                  {saveOutputMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save to Outputs
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold">Team Responses</h2>
                <Badge variant="outline">
                  {responses.filter(r => r.status === "success").length} / {responses.length} successful
                </Badge>
              </div>
              <OutputMultiView
                responses={responses.map(r => ({
                  botName: `${r.botName}${r.task ? ` - ${r.task.slice(0, 50)}...` : ""}`,
                  model: r.status === "error" ? `Error: ${r.error}` : "Success",
                  response: r.output || r.error || "No response",
                }))}
                combinedOutput={combinedOutput}
              />
            </div>
          </>
        )}
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <div className="h-[600px]">
              <ChatInterface
                title={`Team: ${team.name}`}
                chatType="team"
                entityId={teamId!}
                conversationId={teamConversationId}
                onConversationCreated={setTeamConversationId}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
