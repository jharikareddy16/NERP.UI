import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useEmployees } from "@/hooks/useApiData";
import { Trophy } from "lucide-react";
import { useRecognitions } from "@/hooks/useApiData";

const medals = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const { data: employees = [], isLoading } = useEmployees();
  const { data: recognitions = [] } = useRecognitions();
  const leaderboard = employees.map(emp => {
  const points = recognitions
    .filter(r => r.toEmployee?.id === emp.id && r.type === "nomination")
    .reduce((sum, r) => sum + r.points, 0);

  return { ...emp, points };
});

const sorted = leaderboard.sort((a, b) => b.points - a.points);

  if (isLoading) {
    return <div className="flex items-center justify-center p-12 text-muted-foreground">Loading leaderboard...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-7 h-7 text-gold" /> Leaderboard
        </h1>
        <p className="text-muted-foreground mt-1">Top performing employees by recognition points</p>
      </div>

      <div className="grid grid-cols-3 gap-3 items-end">
        {[1, 0, 2].map(idx => {
          const emp = sorted[idx];
          if (!emp) return null;
          const isFirst = idx === 0;
          return (
            <Card key={emp.id} className={`glass-card text-center ${isFirst ? "pb-2" : ""}`}>
              <CardContent className={`p-4 ${isFirst ? "pt-6" : "pt-4"}`}>
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${isFirst ? "gradient-gold" : "bg-muted"}`}>
                  <span className="text-2xl">{medals[idx]}</span>
                </div>
                <Avatar className="h-12 w-12 mx-auto mb-2">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">{emp.avatar}</AvatarFallback>
                </Avatar>
                <p className="font-bold text-sm">{emp.name}</p>
                <p className="text-xs text-muted-foreground">{emp.department}</p>
                <Badge className="mt-2 gradient-gold text-gold-foreground border-0">{emp.points.toLocaleString()} pts</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="glass-card">
        <CardContent className="p-0">
          {sorted.map((emp, i) => (
            <div key={emp.id} className="flex items-center gap-4 p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
              <span className="text-lg font-bold w-8 text-center text-muted-foreground">
                {i < 3 ? medals[i] : `#${i + 1}`}
              </span>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">{emp.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{emp.name}</p>
                <p className="text-xs text-muted-foreground">{emp.role} · {emp.department}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gold">{emp.points.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
