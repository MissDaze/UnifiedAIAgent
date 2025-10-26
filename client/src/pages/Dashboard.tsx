import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Users, FileText, Plus, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import type { Bot as BotType, Team, Output } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  // Fetch real data
  const { data: bots = [] } = useQuery<BotType[]>({ queryKey: ["/api/bots"] });
  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/teams"] });
  const { data: outputs = [] } = useQuery<Output[]>({ queryKey: ["/api/outputs"] });

  const stats = [
    {
      title: "Active Bots",
      value: bots.length,
      description: "AI models configured",
      icon: Bot,
      trend: "+12% from last month",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Teams",
      value: teams.length,
      description: "Collaborative groups",
      icon: Users,
      trend: "+5 new this month",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Outputs Generated",
      value: outputs.length,
      description: "Total completions",
      icon: FileText,
      trend: `${outputs.length} saved`,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Productivity",
      value: "94%",
      description: "AI efficiency score",
      icon: TrendingUp,
      trend: "+8% this week",
      color: "text-warning",
      bgColor: "bg-warning/10"
    }
  ];

  const recentBots = bots.slice(0, 3);
  const recentTeams = teams.slice(0, 3);
  const recentOutputs = outputs.slice(0, 4);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Section */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">AI Nexus Dashboard</h1>
                  <p className="text-muted-foreground">
                    Orchestrate multi-model AI collaboration with precision and power
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setLocation("/bots")} size="lg" className="gap-2 shadow-sm" data-testid="button-create-bot-header">
                <Plus className="h-5 w-5" />
                New Bot
              </Button>
              <Button onClick={() => setLocation("/teams")} size="lg" variant="outline" className="gap-2" data-testid="button-create-team-header">
                <Plus className="h-5 w-5" />
                New Team
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover-elevate border-border/50" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                  <p className="text-xs font-medium text-success">{stat.trend}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bots */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    Recent Bots
                  </CardTitle>
                  <CardDescription>Your latest AI assistants</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/bots")} className="gap-1">
                  View All
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentBots.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground space-y-3">
                  <Bot className="h-12 w-12 mx-auto opacity-50" />
                  <p className="text-sm">No bots created yet</p>
                  <Button onClick={() => setLocation("/bots")} size="sm" className="gap-2">
                    <Plus className="h-3 w-3" />
                    Create Your First Bot
                  </Button>
                </div>
              ) : (
                recentBots.map((bot) => (
                  <div
                    key={bot.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover-elevate cursor-pointer transition-all"
                    onClick={() => setLocation("/bots")}
                    data-testid={`bot-card-${bot.id}`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{bot.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{bot.role || "AI Assistant"}</p>
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0 text-xs font-mono">
                      {bot.model.split('/').pop()?.split(':')[0] || bot.model}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Active Teams */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" />
                    Active Teams
                  </CardTitle>
                  <CardDescription>Collaborative AI groups</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/teams")} className="gap-1">
                  View All
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentTeams.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground space-y-3">
                  <Users className="h-12 w-12 mx-auto opacity-50" />
                  <p className="text-sm">No teams created yet</p>
                  <Button onClick={() => setLocation("/teams")} size="sm" className="gap-2">
                    <Plus className="h-3 w-3" />
                    Create Your First Team
                  </Button>
                </div>
              ) : (
                recentTeams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover-elevate cursor-pointer transition-all"
                    onClick={() => setLocation(`/teams/${team.id}`)}
                    data-testid={`team-card-${team.id}`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{team.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{team.description || "AI team collaboration"}</p>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0">Active</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Outputs */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-success" />
                  Recent Outputs
                </CardTitle>
                <CardDescription>Latest AI-generated content</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/outputs")} className="gap-1" data-testid="button-view-all-outputs">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentOutputs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground space-y-3">
                <FileText className="h-12 w-12 mx-auto opacity-50" />
                <p className="text-sm">No outputs generated yet</p>
                <p className="text-xs">Create a team and submit a brief to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentOutputs.map((output) => (
                  <div
                    key={output.id}
                    className="p-4 rounded-lg border border-border/50 hover-elevate cursor-pointer transition-all space-y-3"
                    onClick={() => setLocation("/outputs")}
                    data-testid={`output-card-${output.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm line-clamp-1">{output.title}</h3>
                      <Badge variant="secondary" className="flex-shrink-0 text-xs">Saved</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {output.combinedOutput?.substring(0, 150) || output.brief?.substring(0, 150) || "No preview available"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>Team collaboration</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Banner */}
        <Card className="gradient-primary text-primary-foreground border-0 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-white to-transparent" />
          <CardContent className="py-8 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Ready to collaborate with AI?</h3>
                <p className="text-primary-foreground/90 max-w-xl">
                  Harness the power of multiple AI models working together. Create bots, build teams, and generate insights.
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setLocation("/bots")} size="lg" variant="secondary" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Bot
                </Button>
                <Button onClick={() => setLocation("/teams")} size="lg" variant="outline" className="gap-2 border-primary-foreground/20 hover:bg-primary-foreground/10 text-primary-foreground">
                  <Plus className="h-4 w-4" />
                  Build Team
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
