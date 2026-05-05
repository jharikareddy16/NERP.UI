import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Star, TrendingUp, Heart } from "lucide-react";
import { recognitionsApi } from "@/services/api";
import { useEffect, useState } from "react";

export default function MyRecognitions() {
  const { user } = useAuth();
  const [recognitions, setRecognitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.userRole === "admin") {
        const res = await recognitionsApi.getMy();
        setRecognitions(res);
    } else {
          const res = await recognitionsApi.getMy();
          setRecognitions(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  // ✅ ADMIN → only pending nominations
  const received =
    user?.userRole === "admin"
      ? recognitions.filter(
          (r) => r.type === "nomination" && r.status === "pending"
        )
      : recognitions.filter((r) => r.toEmployeeId === user?.id);

  const sent = recognitions.filter((r) => r.fromEmployeeId === user?.id);

  const handleApprove = async (id: number) => {
    try {
      await recognitionsApi.approve(id);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await recognitionsApi.reject(id);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          {user?.userRole === "admin" ? "Admin Dashboard" : "My Recognitions"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {user?.userRole === "admin"
            ? "Review and approve nominations"
            : "Your recognition history and points"}
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-5 text-center">
            <Star className="w-8 h-8 text-gold mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {(user?.totalPoints ?? 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Total Points</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-5 text-center">
            <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">{received.length}</p>
            <p className="text-sm text-muted-foreground">
              {user?.userRole === "admin" ? "Pending" : "Received"}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-5 text-center">
            <Heart className="w-8 h-8 text-destructive mx-auto mb-2" />
            <p className="text-2xl font-bold">{sent.length}</p>
            <p className="text-sm text-muted-foreground">Sent</p>
          </CardContent>
        </Card>
      </div>

      {/* 🔥 ADMIN / RECEIVED SECTION */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">
            {user?.userRole === "admin"
              ? "Pending Nominations"
              : "Recognitions Received"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {received.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No data available
            </p>
          ) : (
            received.map((r) => (
              <div
                key={r.id}
                className="flex justify-between items-center gap-3 p-3 rounded-xl bg-muted/50"
              >
                <div className="flex gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {r.fromEmployee?.avatar || "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                   <p className="text-md">
                   <span className="font-semibold text-primary">
                   {r.fromEmployee?.name}
                   </span>{" "}
                   nominated{" "}
                   <span className="font-semibold text-primary">
                   {r.toEmployee?.name}
                   </span>
                   </p>

                  <p className="text-sm text-muted-foreground mt-1">
                    {r.message}
                  </p>

                    <div className="flex items-center gap-2 mt-2">
                      {r.category && (
                        <Badge variant="secondary" className="text-xs">
                          {r.category.icon} {r.category.name}
                        </Badge>
                      )}
                      {/* Points removed */}
                      {r.type === "nomination" && (
                      <span className="text-xs font-medium text-gold">
                      +{r.points} pts
                      </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ✅ ADMIN ACTIONS */}
                {user?.userRole === "admin" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(r.id)}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleReject(r.id)}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* SENT */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Recognitions Sent</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {sent.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No recognitions sent yet
            </p>
          ) : (
            sent.map((r) => (
              <div
                key={r.id}
                className="flex gap-3 p-3 rounded-xl bg-muted/50"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {r.toEmployee?.avatar || "?"}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="text-sm">
                    You recognized{" "}
                    <span className="font-semibold">
                      {r.toEmployee?.name}
                    </span>
                  </p>

                  <p className="text-sm text-muted-foreground mt-1">
                    {r.message}
                  </p>

                  

                    <div className="flex items-center gap-2 mt-2">
                    {r.category && (
                    <Badge variant="secondary" className="text-xs">
                    {r.category.icon} {r.category.name}
                    </Badge>
                    )}

                    {r.type === "nomination" && (
                    <span className="text-xs font-medium text-gold">
                    +{r.points} pts
                    </span>
                    )}
                    </div>
                  </div>
                </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}