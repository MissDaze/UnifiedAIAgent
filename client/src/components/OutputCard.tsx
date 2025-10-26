import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Copy, Trash2, RefreshCw } from "lucide-react";

interface OutputCardProps {
  title: string;
  timestamp: string;
  teamName: string;
  preview: string;
  onCopy?: () => void;
  onDelete?: () => void;
  onIterate?: () => void;
}

export function OutputCard({ title, timestamp, teamName, preview, onCopy, onDelete, onIterate }: OutputCardProps) {
  const handleCopy = () => {
    console.log("Copy output:", title);
    onCopy?.();
  };

  const handleDelete = () => {
    console.log("Delete output:", title);
    onDelete?.();
  };

  const handleIterate = () => {
    console.log("Iterate output:", title);
    onIterate?.();
  };

  return (
    <Card className="hover-elevate" data-testid="card-output">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold mb-1" data-testid="text-title">{title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span data-testid="text-timestamp">{timestamp}</span>
            </div>
          </div>
          <Badge variant="secondary" data-testid="badge-team">{teamName}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3" data-testid="text-preview">
          {preview}
        </p>
      </CardContent>
      
      <CardFooter className="pt-3 border-t gap-2 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          data-testid="button-copy"
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleIterate}
          data-testid="button-iterate"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Iterate
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
