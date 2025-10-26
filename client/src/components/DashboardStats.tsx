import { Card, CardContent } from "@/components/ui/card";
import { Bot, Users, FileText, Zap } from "lucide-react";

//todo: remove mock functionality
const stats = [
  { icon: Bot, label: "Total Bots", value: "12", change: "+3 this week" },
  { icon: Users, label: "Active Teams", value: "5", change: "+2 this week" },
  { icon: FileText, label: "Saved Outputs", value: "48", change: "+15 this week" },
  { icon: Zap, label: "API Usage", value: "2.4K", change: "requests" }
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} data-testid={`card-stat-${index}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
            <div className="text-xs text-primary">{stat.change}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
