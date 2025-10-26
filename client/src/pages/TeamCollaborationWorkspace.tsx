import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { 
  Users, 
  MessageSquare, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ArrowRight,
  Bot,
  User as UserIcon,
  ThumbsUp,
  ThumbsDown,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Team, Bot as BotType, TeamSession } from "@shared/schema";

interface PlanningMessage {
  speaker: "bot" | "user";
  botId?: string;
  botName?: string;
  content: string;
  timestamp: string;
}

interface TaskAssignment {
  botId: string;
  botName: string;
  task: string;
}

interface ExecutionOutput {
  botId: string;
  botName: string;
  task: string;
  output: string;
  status: "success" | "error";
  error?: string;
}

interface Suggestion {
  id: string;
  botId: string;
  botName: string;
  type: "iteration" | "critique";
  target?: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  timestamp: string;
}

export default function TeamCollaborationWorkspace() {
  const [, params] = useRoute("/teams/:id/collaborate");
  const [, setLocation] = useLocation();
  const teamId = params?.id;
  const { toast } = useToast();
  
  // Session state
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [sessionTitle, setSessionTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [currentPhase, setCurrentPhase] = useState<"planning" | "execution" | "review" | "completed">("planning");
  const [showSessionList, setShowSessionList] = useState(false);
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);
  
  // Planning phase state
  const [planningMessages, setPlanningMessages] = useState<PlanningMessage[]>([]);
  const [userMessage, setUserMessage] = useState("");
  const [taskAssignments, setTaskAssignments] = useState<Record<string, string>>({});
  
  // Execution phase state
  const [executionOutputs, setExecutionOutputs] = useState<ExecutionOutput[]>([]);
  
  // Review phase state
  const [reviewMessages, setReviewMessages] = useState<PlanningMessage[]>([]);
  const [userReviewMessage, setUserReviewMessage] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const { data: team, isLoading: teamLoading } = useQuery<Team>({
    queryKey: [`/api/teams/${teamId}`],
    enabled: !!teamId,
  });

  const { data: teamBots = [], isLoading: botsLoading } = useQuery<BotType[]>({
    queryKey: [`/api/teams/${teamId}/bots`],
    enabled: !!teamId,
  });

  // Fetch existing sessions for the team
  const { data: existingSessions = [], isLoading: sessionsLoading } = useQuery<TeamSession[]>({
    queryKey: [`/api/teams/${teamId}/sessions`],
    enabled: !!teamId,
  });

  const { data: session, refetch: refetchSession } = useQuery<TeamSession>({
    queryKey: [`/api/team-sessions/${sessionId}`],
    enabled: !!sessionId,
  });

  // Auto-load latest incomplete session on mount (only once, and only if user hasn't made a choice)
  useEffect(() => {
    if (!sessionId && !hasAutoLoaded && !showSessionList && existingSessions.length > 0 && !sessionsLoading) {
      // Find the latest incomplete session
      const incompleteSession = existingSessions.find(s => s.phase !== "completed");
      if (incompleteSession) {
        setSessionId(incompleteSession.id);
      } else {
        // All sessions are completed, show session list
        setShowSessionList(true);
      }
      setHasAutoLoaded(true);
    }
  }, [existingSessions, sessionId, sessionsLoading, hasAutoLoaded, showSessionList]);

  // Sync session data to local state when loaded
  useEffect(() => {
    if (session) {
      setBrief(session.brief);
      setCurrentPhase(session.phase as any);
      setPlanningMessages((session.planningMessages as PlanningMessage[]) || []);
      setTaskAssignments(
        ((session.taskAssignments as TaskAssignment[]) || []).reduce((acc, ta) => {
          acc[ta.botId] = ta.task;
          return acc;
        }, {} as Record<string, string>)
      );
      setExecutionOutputs((session.executionOutputs as ExecutionOutput[]) || []);
      setReviewMessages((session.reviewMessages as PlanningMessage[]) || []);
      setSuggestions((session.suggestions as Suggestion[]) || []);
    }
  }, [session]);

  const createSessionMutation = useMutation({
    mutationFn: async (data: { title: string; brief: string }) => {
      const response = await apiRequest("POST", "/api/team-sessions", {
        teamId,
        title: data.title,
        brief: data.brief,
        phase: "planning",
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setSessionId(data.id);
      toast({
        title: "Session Created",
        description: "Collaborative session started successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive",
      });
    },
  });

  const addPlanningMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/team-sessions/${sessionId}/planning-message`, {
        speaker: "user",
        content,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setPlanningMessages((data.planningMessages as PlanningMessage[]) || []);
      setUserMessage("");
      refetchSession();
    },
  });

  const botQuestionMutation = useMutation({
    mutationFn: async (botId: string) => {
      const response = await apiRequest("POST", `/api/team-sessions/${sessionId}/planning/bot-question`, {
        botId,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setPlanningMessages((data.session.planningMessages as PlanningMessage[]) || []);
      refetchSession();
      toast({
        title: "Bot Question Generated",
        description: "The bot has asked a clarifying question",
      });
    },
  });

  const finalizePlanningMutation = useMutation({
    mutationFn: async () => {
      const assignments: TaskAssignment[] = teamBots.map(bot => ({
        botId: bot.id,
        botName: bot.name,
        task: taskAssignments[bot.id] || "Contribute to the project based on your expertise",
      }));

      const response = await apiRequest("POST", `/api/team-sessions/${sessionId}/finalize-planning`, {
        taskAssignments: assignments,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setCurrentPhase("execution");
      refetchSession();
      toast({
        title: "Planning Complete",
        description: "Moving to execution phase",
      });
    },
  });

  const executeTasksMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/team-sessions/${sessionId}/execute`, {});
      return await response.json();
    },
    onSuccess: (data) => {
      setExecutionOutputs(data.responses);
      setCurrentPhase("review");
      refetchSession();
      toast({
        title: "Execution Complete",
        description: "All bots have completed their tasks. Moving to review phase.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Execution Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addReviewMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/team-sessions/${sessionId}/review-message`, {
        speaker: "user",
        content,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setReviewMessages((data.reviewMessages as PlanningMessage[]) || []);
      setUserReviewMessage("");
      refetchSession();
    },
  });

  const approveSuggestionMutation = useMutation({
    mutationFn: async ({ suggestionId, status }: { suggestionId: string; status: "approved" | "rejected" }) => {
      const response = await apiRequest("PATCH", `/api/team-sessions/${sessionId}/suggestion/${suggestionId}`, {
        status,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setSuggestions((data.suggestions as Suggestion[]) || []);
      refetchSession();
      toast({
        title: "Suggestion Updated",
        description: "Your decision has been recorded",
      });
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/team-sessions/${sessionId}/complete`, {});
      return await response.json();
    },
    onSuccess: () => {
      setCurrentPhase("completed");
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}/sessions`] });
      toast({
        title: "Session Complete",
        description: "Collaborative session has been completed successfully",
      });
    },
  });

  const handleStartSession = () => {
    if (!sessionTitle.trim() || !brief.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and brief",
        variant: "destructive",
      });
      return;
    }
    createSessionMutation.mutate({ title: sessionTitle, brief });
    setShowSessionList(false);
    setHasAutoLoaded(true); // User explicitly created a session
  };

  const handleLoadSession = (session: TeamSession) => {
    setSessionId(session.id);
    setShowSessionList(false);
    setHasAutoLoaded(true); // User explicitly chose a session
  };

  const handleNewSession = () => {
    setSessionId(undefined);
    setSessionTitle("");
    setBrief("");
    setShowSessionList(false);
    setHasAutoLoaded(true); // User explicitly chose to create new session
  };

  const handleBotAskQuestion = (botId: string) => {
    botQuestionMutation.mutate(botId);
  };

  const handleSendPlanningMessage = () => {
    if (!userMessage.trim()) return;
    addPlanningMessageMutation.mutate(userMessage);
  };

  const handleSendReviewMessage = () => {
    if (!userReviewMessage.trim()) return;
    addReviewMessageMutation.mutate(userReviewMessage);
  };

  if (teamLoading || botsLoading || sessionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Team not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (teamBots.length === 0) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <p className="font-medium">No Team Members</p>
                <p className="text-sm text-muted-foreground">Add bots to this team before starting a collaborative session</p>
              </div>
              <Button onClick={() => setLocation(`/teams/${teamId}`)} data-testid="button-back-to-team">
                Back to Team
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
            Collaborative Workspace
          </h1>
          <p className="text-muted-foreground">
            {team.name} - Multi-phase team collaboration
          </p>
        </div>

        {/* Phase Progress Indicator */}
        {sessionId && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className={`flex items-center gap-2 ${currentPhase === "planning" ? "text-primary" : "text-muted-foreground"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPhase === "planning" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    1
                  </div>
                  <span className="font-medium">Planning</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className={`flex items-center gap-2 ${currentPhase === "execution" ? "text-primary" : "text-muted-foreground"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPhase === "execution" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    2
                  </div>
                  <span className="font-medium">Execution</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className={`flex items-center gap-2 ${currentPhase === "review" ? "text-primary" : "text-muted-foreground"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPhase === "review" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    3
                  </div>
                  <span className="font-medium">Review</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className={`flex items-center gap-2 ${currentPhase === "completed" ? "text-primary" : "text-muted-foreground"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPhase === "completed" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Complete</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Selection or Creation */}
        {!sessionId && showSessionList && existingSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Choose Session
              </CardTitle>
              <CardDescription>
                Resume an existing session or start a new one
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Sessions */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Existing Sessions:</p>
                {existingSessions.map(session => (
                  <Card key={session.id} className="hover-elevate cursor-pointer" onClick={() => handleLoadSession(session)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium mb-1" data-testid={`text-session-title-${session.id}`}>
                            {session.title}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {session.brief}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant={session.phase === "completed" ? "secondary" : "default"}>
                              {session.phase}
                            </Badge>
                            {session.createdAt && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(session.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadSession(session);
                          }}
                          data-testid={`button-load-${session.id}`}
                        >
                          {session.phase === "completed" ? "View" : "Resume"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Separator />
              <Button
                onClick={() => {
                  handleNewSession();
                  setHasAutoLoaded(true); // User explicitly chose to start new session
                }}
                variant="outline"
                className="w-full"
                data-testid="button-new-session-switch"
              >
                <Play className="h-4 w-4 mr-2" />
                Start New Session
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Session Creation Form (if no session selected and not showing list) */}
        {!sessionId && !showSessionList && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Start Collaborative Session
                  </CardTitle>
                  <CardDescription>
                    Create a new session where your team will work together through planning, execution, and review
                  </CardDescription>
                </div>
                {existingSessions.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowSessionList(true);
                      setHasAutoLoaded(true); // User explicitly chose to view sessions
                    }}
                    data-testid="button-show-sessions"
                  >
                    View Existing
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="session-title">Session Title</Label>
                <Input
                  id="session-title"
                  placeholder="e.g., Website Redesign Project"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  data-testid="input-session-title"
                />
              </div>
              <div>
                <Label htmlFor="brief">Project Brief</Label>
                <Textarea
                  id="brief"
                  placeholder="Describe what you want the team to work on..."
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  rows={6}
                  data-testid="input-brief"
                />
              </div>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm font-medium mb-2">Team Members ({teamBots.length})</p>
                <div className="flex flex-wrap gap-2">
                  {teamBots.map(bot => (
                    <Badge key={bot.id} variant="secondary" data-testid={`badge-bot-${bot.id}`}>
                      <Bot className="h-3 w-3 mr-1" />
                      {bot.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleStartSession}
                disabled={createSessionMutation.isPending}
                size="lg"
                className="w-full"
                data-testid="button-start-session"
              >
                {createSessionMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating Session...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start Collaborative Session
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* PLANNING PHASE */}
        {sessionId && currentPhase === "planning" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Planning Phase
                </CardTitle>
                <CardDescription>
                  Discuss the brief with your team, answer their questions, and assign specific tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Brief Display */}
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Project Brief:</p>
                  <p className="text-sm text-foreground">{brief}</p>
                </div>

                {/* Bot Question Buttons */}
                <div>
                  <p className="text-sm font-medium mb-3">Ask bots for their questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {teamBots.map(bot => (
                      <Button
                        key={bot.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleBotAskQuestion(bot.id)}
                        disabled={botQuestionMutation.isPending}
                        data-testid={`button-ask-${bot.id}`}
                      >
                        <Bot className="h-3 w-3 mr-1" />
                        Ask {bot.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Planning Conversation */}
                {planningMessages.length > 0 && (
                  <div className="space-y-3">
                    <Separator />
                    <p className="text-sm font-medium">Planning Discussion:</p>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {planningMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${
                            msg.speaker === "user"
                              ? "bg-primary/10 ml-4 sm:ml-12"
                              : "bg-muted mr-4 sm:mr-12"
                          }`}
                          data-testid={`message-planning-${idx}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {msg.speaker === "user" ? (
                              <UserIcon className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                            <span className="text-sm font-medium">
                              {msg.speaker === "user" ? "You" : msg.botName}
                            </span>
                          </div>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Message Input */}
                <div className="space-y-2">
                  <Label htmlFor="user-message">Your Response / Message</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Textarea
                      id="user-message"
                      placeholder="Answer questions or provide clarification..."
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      rows={3}
                      className="flex-1"
                      data-testid="input-user-message"
                    />
                    <Button
                      onClick={handleSendPlanningMessage}
                      disabled={!userMessage.trim() || addPlanningMessageMutation.isPending}
                      className="sm:self-start"
                      data-testid="button-send-message"
                    >
                      Send
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Task Assignments */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Assign Specific Tasks</p>
                    <p className="text-sm text-muted-foreground">Define what each bot should do</p>
                  </div>
                  {teamBots.map(bot => (
                    <div key={bot.id} className="space-y-2">
                      <Label htmlFor={`task-${bot.id}`}>
                        {bot.name} ({bot.role || "General Assistant"})
                      </Label>
                      <Textarea
                        id={`task-${bot.id}`}
                        placeholder={`Task for ${bot.name}...`}
                        value={taskAssignments[bot.id] || ""}
                        onChange={(e) => setTaskAssignments(prev => ({
                          ...prev,
                          [bot.id]: e.target.value
                        }))}
                        rows={2}
                        data-testid={`input-task-${bot.id}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Finalize Planning Button */}
                <Button
                  onClick={() => finalizePlanningMutation.mutate()}
                  disabled={finalizePlanningMutation.isPending || Object.values(taskAssignments).every(t => !t.trim())}
                  size="lg"
                  className="w-full"
                  data-testid="button-finalize-planning"
                >
                  {finalizePlanningMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Finalizing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-5 w-5 mr-2" />
                      Finalize Planning & Move to Execution
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* EXECUTION PHASE */}
        {sessionId && currentPhase === "execution" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Execution Phase
                </CardTitle>
                <CardDescription>
                  Run collaborative execution - bots will work together, each seeing previous teammates' outputs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Task Assignments Display */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">Task Assignments:</p>
                  {Object.entries(taskAssignments).map(([botId, task]) => {
                    const bot = teamBots.find(b => b.id === botId);
                    if (!bot) return null;
                    return (
                      <div key={botId} className="p-3 bg-muted rounded-lg" data-testid={`task-display-${botId}`}>
                        <p className="text-sm font-medium mb-1">{bot.name}</p>
                        <p className="text-sm text-muted-foreground">{task}</p>
                      </div>
                    );
                  })}
                </div>

                {executionOutputs.length === 0 ? (
                  <Button
                    onClick={() => executeTasksMutation.mutate()}
                    disabled={executeTasksMutation.isPending}
                    size="lg"
                    className="w-full"
                    data-testid="button-execute-tasks"
                  >
                    {executeTasksMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Executing Collaboratively...
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Execute Team Tasks
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm font-medium">Execution Results:</p>
                    {executionOutputs.map((output, idx) => (
                      <Card key={idx} data-testid={`output-${output.botId}`}>
                        <CardHeader>
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-base">{output.botName}</CardTitle>
                            {output.status === "success" ? (
                              <Badge variant="secondary">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Success
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Error
                              </Badge>
                            )}
                          </div>
                          <CardDescription>{output.task}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {output.status === "success" ? (
                            <div className="prose prose-sm max-w-none">
                              <p className="whitespace-pre-wrap text-sm">{output.output}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-destructive">{output.error}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* REVIEW PHASE */}
        {sessionId && currentPhase === "review" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Review Phase
                </CardTitle>
                <CardDescription>
                  Review outputs, discuss improvements, and approve/reject bot suggestions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Execution Outputs */}
                <div className="space-y-4">
                  <p className="text-sm font-medium">Team Outputs:</p>
                  {executionOutputs.map((output, idx) => (
                    <Card key={idx} data-testid={`review-output-${output.botId}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-base">{output.botName}</CardTitle>
                          {output.status === "success" ? (
                            <Badge variant="secondary">Success</Badge>
                          ) : (
                            <Badge variant="destructive">Error</Badge>
                          )}
                        </div>
                        <CardDescription>{output.task}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {output.status === "success" ? (
                          <p className="whitespace-pre-wrap text-sm">{output.output}</p>
                        ) : (
                          <p className="text-sm text-destructive">{output.error}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator />

                {/* Review Discussion */}
                {reviewMessages.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Review Discussion:</p>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {reviewMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${
                            msg.speaker === "user"
                              ? "bg-primary/10 ml-4 sm:ml-12"
                              : "bg-muted mr-4 sm:mr-12"
                          }`}
                          data-testid={`message-review-${idx}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {msg.speaker === "user" ? (
                              <UserIcon className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                            <span className="text-sm font-medium">
                              {msg.speaker === "user" ? "You" : msg.botName}
                            </span>
                          </div>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Review Input */}
                <div className="space-y-2">
                  <Label htmlFor="user-review">Your Feedback / Comments</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Textarea
                      id="user-review"
                      placeholder="Provide feedback on the outputs, request changes, or ask questions..."
                      value={userReviewMessage}
                      onChange={(e) => setUserReviewMessage(e.target.value)}
                      rows={3}
                      className="flex-1"
                      data-testid="input-user-review"
                    />
                    <Button
                      onClick={handleSendReviewMessage}
                      disabled={!userReviewMessage.trim() || addReviewMessageMutation.isPending}
                      className="sm:self-start"
                      data-testid="button-send-review"
                    >
                      Send
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Suggestions (if any) */}
                {suggestions.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Bot Suggestions:</p>
                    {suggestions.map((suggestion) => (
                      <Card key={suggestion.id} data-testid={`suggestion-${suggestion.id}`}>
                        <CardHeader>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4" />
                              <span className="font-medium text-sm">{suggestion.botName}</span>
                              <Badge variant="outline" className="text-xs">
                                {suggestion.type}
                              </Badge>
                            </div>
                            {suggestion.status === "pending" ? (
                              <Badge>Pending</Badge>
                            ) : suggestion.status === "approved" ? (
                              <Badge variant="secondary">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                Approved
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <ThumbsDown className="h-3 w-3 mr-1" />
                                Rejected
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm">{suggestion.content}</p>
                          {suggestion.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => approveSuggestionMutation.mutate({ suggestionId: suggestion.id, status: "approved" })}
                                disabled={approveSuggestionMutation.isPending}
                                data-testid={`button-approve-${suggestion.id}`}
                              >
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveSuggestionMutation.mutate({ suggestionId: suggestion.id, status: "rejected" })}
                                disabled={approveSuggestionMutation.isPending}
                                data-testid={`button-reject-${suggestion.id}`}
                              >
                                <ThumbsDown className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Complete Session Button */}
                <Button
                  onClick={() => completeSessionMutation.mutate()}
                  disabled={completeSessionMutation.isPending}
                  size="lg"
                  className="w-full"
                  data-testid="button-complete-session"
                >
                  {completeSessionMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Complete Session
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* COMPLETED PHASE */}
        {sessionId && currentPhase === "completed" && (
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
              <div>
                <h3 className="text-2xl font-bold mb-2">Session Complete!</h3>
                <p className="text-muted-foreground">
                  The collaborative session has been completed successfully
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setLocation(`/teams/${teamId}`)} data-testid="button-back-team">
                  Back to Team
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSessionId(undefined);
                    setShowSessionList(true);
                    setHasAutoLoaded(true);
                  }} 
                  data-testid="button-view-sessions"
                >
                  View All Sessions
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSessionId(undefined);
                    setSessionTitle("");
                    setBrief("");
                    setShowSessionList(false);
                    setHasAutoLoaded(true);
                  }} 
                  data-testid="button-new-session"
                >
                  Start New Session
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
