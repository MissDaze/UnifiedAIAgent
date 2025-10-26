import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Users, Plus, Trash2, ArrowRight, Sparkles, Bot, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Team } from "@shared/schema";
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

export default function TeamsManagement() {
  const { toast } = useToast();

  const { data: teams = [], isLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/teams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({
        title: "Success",
        description: "Team deleted successfully",
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
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading your AI teams...</p>
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
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Teams</h1>
                  <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">
                    Orchestrate multi-bot collaboration for complex workflows
                  </p>
                </div>
              </div>
            </div>
            <Link href="/teams/create" className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 shadow-sm w-full sm:w-auto" data-testid="button-create-new-team">
                <Plus className="h-5 w-5" />
                Create New Team
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <span className="text-muted-foreground">Total Teams:</span>
              <span className="font-semibold">{teams.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-muted-foreground">Collaborative Groups:</span>
              <span className="font-semibold">{teams.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {teams.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No AI teams yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Create your first AI team by selecting multiple bots to collaborate on complex tasks. 
                Each bot brings unique capabilities to solve problems together.
              </p>
              <Link href="/teams/create">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Your First Team
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card 
                key={team.id} 
                className="hover-elevate border-border/50 overflow-hidden group" 
                data-testid={`card-team-${team.id}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-accent flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Users className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <div className="flex gap-1">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            data-testid={`button-delete-team-${team.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete AI Team</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "<strong>{team.name}</strong>"? 
                              This will remove all team configurations and conversations. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteTeamMutation.mutate(team.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Team
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <CardTitle className="text-xl mb-2">{team.name}</CardTitle>
                  <Badge variant="outline" className="w-fit text-xs">
                    <Bot className="h-3 w-3 mr-1" />
                    Multi-Bot Collaboration
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Description */}
                  {team.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {team.description}
                    </p>
                  )}

                  {/* Team Info Badge */}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <Layers className="h-4 w-4 text-accent flex-shrink-0" />
                    <span className="text-sm font-medium">
                      Collaborative AI Workspace
                    </span>
                  </div>


                  {/* Open Workspace Button */}
                  <Link href={`/teams/${team.id}`}>
                    <Button 
                      className="w-full gap-2" 
                      data-testid={`button-open-team-${team.id}`}
                    >
                      Open Workspace
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Banner */}
        {teams.length > 0 && (
          <Card className="mt-8 border-accent/20 bg-accent/5">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Power of Team Collaboration</h3>
                  <p className="text-sm text-muted-foreground">
                    AI teams enable multiple specialized bots to work together on complex tasks. 
                    Each bot contributes its unique perspective and capabilities, delivering richer, 
                    more comprehensive results than any single AI model could achieve alone.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
