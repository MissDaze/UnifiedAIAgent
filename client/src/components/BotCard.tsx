import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Edit, Trash2, AlertTriangle } from "lucide-react";

interface BotCardProps {
  name: string;
  model: string;
  purpose: string;
  role: string;
  modelValid?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function BotCard({ name, model, purpose, role, modelValid = true, onEdit, onDelete }: BotCardProps) {
  const handleEdit = () => {
    console.log("Edit bot:", name);
    onEdit?.();
  };

  const handleDelete = () => {
    console.log("Delete bot:", name);
    onDelete?.();
  };

  return (
    <Card className="hover-elevate" data-testid="card-bot">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold" data-testid="text-bot-name">{name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs font-mono" data-testid="badge-model">
                  {model}
                </Badge>
                {modelValid === false && (
                  <Badge variant="destructive" className="text-xs gap-1" data-testid="badge-invalid-model">
                    <AlertTriangle className="h-3 w-3" />
                    Invalid Model
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        {modelValid === false && (
          <div className="mb-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20" data-testid="alert-invalid-model">
            <div className="flex gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div className="text-xs text-destructive-foreground">
                <p className="font-medium mb-1">This model is no longer available</p>
                <p className="text-muted-foreground">Delete this bot and create a new one with a working model to fix the issue.</p>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Role:</span>
            <p className="text-sm mt-1" data-testid="text-role">{role}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Purpose:</span>
            <p className="text-sm mt-1 text-muted-foreground" data-testid="text-purpose">{purpose}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 border-t gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          data-testid="button-edit"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          data-testid="button-delete"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
