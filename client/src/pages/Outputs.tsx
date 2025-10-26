import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileText, Trash2, Calendar, Users, Bot as BotIcon, Archive, Sparkles, Layers } from "lucide-react";
import { format } from "date-fns";
import type { Output } from "@shared/schema";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Outputs() {
  const { toast } = useToast();
  const [selectedOutput, setSelectedOutput] = useState<Output | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [outputToDelete, setOutputToDelete] = useState<string | null>(null);

  const { data: outputs = [], isLoading } = useQuery<Output[]>({
    queryKey: ["/api/outputs"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/outputs/${id}`);
      if (!response.ok) {
        throw new Error("Failed to delete output");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outputs"] });
      toast({
        title: "Deleted",
        description: "Output deleted successfully",
      });
      if (selectedOutput?.id === outputToDelete) {
        setSelectedOutput(null);
      }
      setDeleteDialogOpen(false);
      setOutputToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete output",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    setOutputToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (outputToDelete) {
      deleteMutation.mutate(outputToDelete);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-success border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading your saved outputs...</p>
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
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Archive className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Output Library</h1>
                  <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">
                    Browse and manage your AI collaboration results
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span className="text-muted-foreground">Total Saved:</span>
                <span className="font-semibold">{outputs.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {outputs.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No saved outputs yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Execute team tasks in the Team Workspace and save the results to build your output library
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Outputs List */}
            <div className="lg:col-span-1">
              <Card className="border-border/50">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                    Saved Results
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {outputs.length} output{outputs.length !== 1 ? "s" : ""} in your library
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px] sm:h-[650px] px-4 sm:px-6">
                    <div className="space-y-3 pb-4">
                      {outputs.map((output) => (
                        <Card
                          key={output.id}
                          className={`cursor-pointer transition-all hover-elevate border-border/50 ${
                            selectedOutput?.id === output.id ? "border-success shadow-sm bg-success/5" : ""
                          }`}
                          onClick={() => setSelectedOutput(output)}
                          data-testid={`card-output-${output.id}`}
                        >
                          <CardHeader className="p-4 space-y-0 pb-3">
                            <h4 className="font-semibold text-sm line-clamp-1">{output.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                              <Calendar className="h-3 w-3" />
                              {output.createdAt ? format(new Date(output.createdAt), "MMM d, yyyy") : "Unknown"}
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0 space-y-2">
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {output.brief}
                            </p>
                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                              <Badge variant="secondary" className="text-xs gap-1">
                                <Users className="h-3 w-3" />
                                {Array.isArray(output.responses) ? output.responses.length : 0} bots
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(output.id);
                                }}
                                data-testid={`button-delete-${output.id}`}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Output Detail */}
            <div className="lg:col-span-2">
              {selectedOutput ? (
                <Card className="border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-success" />
                          <CardTitle className="text-2xl">{selectedOutput.title}</CardTitle>
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {selectedOutput.createdAt
                            ? format(new Date(selectedOutput.createdAt), "MMMM d, yyyy 'at' h:mm a")
                            : "Unknown date"}
                        </CardDescription>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(selectedOutput.id)}
                        data-testid="button-delete-selected"
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Brief */}
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Original Brief
                      </h3>
                      <Card className="bg-muted/50 border-border/50">
                        <CardContent className="pt-4">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedOutput.brief}</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Separator />

                    {/* Responses */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4 text-accent" />
                        AI Team Responses
                      </h3>
                      <Tabs defaultValue="combined" className="w-full">
                        <TabsList className="grid w-full grid-cols-auto">
                          <TabsTrigger value="combined" data-testid="tab-combined" className="gap-2">
                            <Layers className="h-3 w-3" />
                            Combined
                          </TabsTrigger>
                          {Array.isArray(selectedOutput.responses) &&
                            (selectedOutput.responses as any[]).map((response: any, idx: number) => (
                              <TabsTrigger
                                key={response.botId || idx}
                                value={response.botId || `bot-${idx}`}
                                data-testid={`tab-bot-${response.botId || idx}`}
                                className="gap-2"
                              >
                                <BotIcon className="h-3 w-3" />
                                {response.botName || `Bot ${idx + 1}`}
                              </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="combined" data-testid="content-combined" className="mt-4">
                          <Card className="bg-muted/30 border-border/50">
                            <CardContent className="pt-6">
                              {selectedOutput.combinedOutput ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <p className="whitespace-pre-wrap leading-relaxed">{selectedOutput.combinedOutput}</p>
                                </div>
                              ) : (
                                <div className="space-y-6">
                                  {Array.isArray(selectedOutput.responses) &&
                                    (selectedOutput.responses as any[]).map((response: any, idx: number) => (
                                      <div key={response.botId || idx} className="space-y-3">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <BotIcon className="h-4 w-4 text-primary" />
                                          </div>
                                          <div className="flex-1">
                                            <span className="font-semibold text-sm">
                                              {response.botName || `Bot ${idx + 1}`}
                                            </span>
                                            {response.task && (
                                              <p className="text-xs text-muted-foreground">Task: {response.task}</p>
                                            )}
                                          </div>
                                          {response.status === "error" && (
                                            <Badge variant="destructive" className="text-xs">Error</Badge>
                                          )}
                                        </div>
                                        {response.status === "error" && response.error ? (
                                          <Card className="bg-destructive/5 border-destructive/20">
                                            <CardContent className="pt-4">
                                              <p className="text-sm text-destructive">{response.error}</p>
                                            </CardContent>
                                          </Card>
                                        ) : (
                                          <p className="text-sm whitespace-pre-wrap leading-relaxed pl-11">
                                            {response.output}
                                          </p>
                                        )}
                                        {idx < (selectedOutput.responses as any[]).length - 1 && (
                                          <Separator className="my-4" />
                                        )}
                                      </div>
                                    ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {Array.isArray(selectedOutput.responses) &&
                          (selectedOutput.responses as any[]).map((response: any, idx: number) => (
                            <TabsContent
                              key={response.botId || idx}
                              value={response.botId || `bot-${idx}`}
                              data-testid={`content-bot-${response.botId || idx}`}
                              className="mt-4"
                            >
                              <Card className="bg-muted/30 border-border/50">
                                <CardHeader className="pb-4">
                                  <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                      <BotIcon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                      <CardTitle className="text-lg">
                                        {response.botName || `Bot ${idx + 1}`}
                                      </CardTitle>
                                      {response.task && (
                                        <CardDescription className="mt-1">
                                          <span className="font-medium">Task:</span> {response.task}
                                        </CardDescription>
                                      )}
                                    </div>
                                    {response.status === "error" && (
                                      <Badge variant="destructive">Error</Badge>
                                    )}
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  {response.status === "error" && response.error ? (
                                    <Card className="bg-destructive/5 border-destructive/20">
                                      <CardContent className="pt-4">
                                        <p className="text-sm text-destructive">{response.error}</p>
                                      </CardContent>
                                    </Card>
                                  ) : (
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                      <p className="whitespace-pre-wrap leading-relaxed">{response.output}</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </TabsContent>
                          ))}
                      </Tabs>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed border-2 border-border/50">
                  <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Select an output</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Choose an output from the list on the left to view its complete details and team responses
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete saved output?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this AI collaboration result from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
