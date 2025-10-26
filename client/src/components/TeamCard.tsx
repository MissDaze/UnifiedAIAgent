import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Play, Edit } from "lucide-react";

interface TeamMember {
  name: string;
  initials: string;
}

interface TeamCardProps {
  name: string;
  members: TeamMember[];
  description: string;
  onStart?: () => void;
  onEdit?: () => void;
}

export function TeamCard({ name, members, description, onStart, onEdit }: TeamCardProps) {
  const handleStart = () => {
    console.log("Start team:", name);
    onStart?.();
  };

  const handleEdit = () => {
    console.log("Edit team:", name);
    onEdit?.();
  };

  return (
    <Card className="hover-elevate" data-testid="card-team">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold" data-testid="text-team-name">{name}</h3>
              <p className="text-xs text-muted-foreground">{members.length} members</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground mb-3" data-testid="text-description">{description}</p>
        <div className="flex -space-x-2">
          {members.slice(0, 5).map((member, index) => (
            <Avatar key={index} className="border-2 border-card w-8 h-8" data-testid={`avatar-member-${index}`}>
              <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
            </Avatar>
          ))}
          {members.length > 5 && (
            <Avatar className="border-2 border-card w-8 h-8">
              <AvatarFallback className="text-xs">+{members.length - 5}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 border-t gap-2">
        <Button
          size="sm"
          onClick={handleStart}
          data-testid="button-start"
        >
          <Play className="h-4 w-4 mr-1" />
          Start
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          data-testid="button-edit"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
