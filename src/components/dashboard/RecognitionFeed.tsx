import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ApiRecognition } from "@/services/api";
import { Heart, Award } from "lucide-react";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function RecognitionFeed({ items }: { items: ApiRecognition[] }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Recognitions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No recognitions yet</p>
        ) : (
          items.map(r => (
            <div key={r.id} className="flex gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{r.fromEmployee?.avatar || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{r.fromEmployee?.name}</span>
                  {r.type === "appreciation" ? (
                    <Heart className="w-3.5 h-3.5 text-destructive fill-destructive" />
                  ) : (
                    <Award className="w-3.5 h-3.5 text-gold" />
                  )}
                  <span className="font-semibold text-sm">{r.toEmployee?.name}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  {r.category && (
                    <Badge variant="secondary" className="text-xs">
                      {r.category.icon} {r.category.name}
                    </Badge>
                  )}
                  {/* <span className="text-xs font-medium text-gold">+{r.points} pts</span> */}
                  {r.type === "nomination" && (
                  <span className="text-xs font-medium text-gold">
                  +{r.points} pts
                  </span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">{timeAgo(r.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
